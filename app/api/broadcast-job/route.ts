import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
    try {
        const { jobId, jobTitle, department, location } = await request.json()

        if (!jobId || !jobTitle) {
            return NextResponse.json({ error: "Missing job details" }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Get user to ensure authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Fetch all candidates (role = 'candidate')
        const { data: candidates, error: fetchError } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("role", "candidate")

        if (fetchError) throw fetchError
        if (!candidates || candidates.length === 0) {
            return NextResponse.json({ success: true, message: "No candidates to notify" })
        }

        // 3. Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })

        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            return NextResponse.json({ error: "Email configuration missing" }, { status: 500 })
        }

        // 4. Send emails in batches or iterate
        // Using a simple loop for now, in production batching is better
        const origin = new URL(request.url).origin
        const jobUrl = `${origin}/candidate/jobs/${jobId}`

        const results = await Promise.allSettled(
            candidates.map(async (candidate) => {
                const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #2563eb;">New Job Opportunity at HireX</h2>
            <p>Hi ${candidate.full_name || 'there'},</p>
            <p>We've just posted a new position that might interest you:</p>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
              <h3 style="margin-top: 0;">${jobTitle}</h3>
              <p style="margin-bottom: 5px;"><strong>Department:</strong> ${department || 'N/A'}</p>
              <p style="margin-bottom: 5px;"><strong>Location:</strong> ${location || 'N/A'}</p>
              <a href="${jobUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Job Details</a>
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">Best regards,<br>The HireX Team</p>
          </div>
        `

                await transporter.sendMail({
                    from: `"HireX Careers" <${process.env.GMAIL_USER}>`,
                    to: candidate.email,
                    subject: `New Job Opportunity: ${jobTitle}`,
                    html: html,
                    text: `Hi, a new job for ${jobTitle} has been posted on HireX. View it here: ${jobUrl}`
                })

                // Log to communications
                await supabase.from("communications").insert({
                    sender_id: user.id,
                    recipient: candidate.email,
                    subject: `Job Alert: ${jobTitle}`,
                    body: `Broadcasted new job alert for ${jobTitle}`
                })
            })
        )

        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        return NextResponse.json({
            success: true,
            message: `Broadcast completed. Sent: ${successful}, Failed: ${failed}`
        })

    } catch (error: any) {
        console.error("[Broadcast Job] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
