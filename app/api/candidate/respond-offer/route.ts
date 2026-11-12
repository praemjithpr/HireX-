import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const { applicationId, decision } = await request.json()

        if (!applicationId || !['accepted', 'rejected'].includes(decision)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Fetch application to verify ownership
        const { data: application, error: fetchError } = await supabase
            .from("applications")
            .select("*, jobs(*)")
            .eq("id", applicationId)
            .eq("candidate_id", user.id)
            .single()

        if (fetchError || !application) {
            // Also check resumes table for email candidates if linked to this user
            // But usually email candidates don't have a login. 
            // If they do, they use 'applications' table.
            return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 404 })
        }

        if (application.status !== "offer") {
            return NextResponse.json({ error: "No active offer to respond to" }, { status: 400 })
        }

        // 3. Update application
        const updates: any = {
            offer_response: decision,
            offer_response_at: new Date().toISOString(),
        }

        // If accepted, moving to hired. If rejected, moving to rejected.
        if (decision === 'accepted') {
            updates.status = 'hired'
        } else if (decision === 'rejected') {
            updates.status = 'rejected'
        }

        const { error: updateError } = await supabase
            .from("applications")
            .update(updates)
            .eq("id", applicationId)

        if (updateError) throw updateError

        // 4. Check for auto-replacement if rejected
        let autoReplacementMessage = ''
        let promotedCandidate: any = null

        if (decision === 'rejected') {
            const { data: shortlisted, error: slError } = await supabase
                .from("applications")
                .select("*, profiles!inner(*)")
                .eq("job_id", application.jobs.id)
                .eq("status", "shortlisted")
                .order("assessment_score", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: true })
                .limit(1)
                .single()

            if (shortlisted && !slError) {
                // 1. Promote to Offer (Database Action)
                await supabase
                    .from("applications")
                    .update({
                        status: "offer",
                        offer_sent_at: new Date().toISOString(),
                        offer_response: "pending"
                    })
                    .eq("id", shortlisted.id)

                promotedCandidate = shortlisted

                autoReplacementMessage = `<p style="margin-top: 15px; padding: 10px; background-color: #f3f4f6; border-radius: 6px; font-size: 13px;">
                    <strong>Auto-Action Triggered:</strong> The next best candidate, <strong>${shortlisted.profiles.full_name} (Score: ${shortlisted.assessment_score || 0}%)</strong>, 
                    who was "Shortlisted", has now been automatically promoted to "Offer" and notified via email.
                </p>`
            }
        }

        // 5. Send notifications (Email Layer)
        try {
            const nodemailer = require("nodemailer")
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            })

            const { data: recruiterProfile } = await supabase
                .from("profiles")
                .select("email, full_name")
                .eq("id", application.jobs.created_by)
                .single()

            // Notify the new candidate if one was promoted
            if (promotedCandidate) {
                const newCandidateName = promotedCandidate.profiles.full_name
                const newCandidateEmail = promotedCandidate.profiles.email

                const htmlNewOffer = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                        <h2 style="color: #2563eb;">Employment Offer</h2>
                        <p>Dear ${newCandidateName},</p>
                        <p>We are delighted to offer you the position of <strong>${application.jobs.title}</strong> at HireX.</p>
                        <p>Please log in to your dashboard to view the official offer details and accept or decline.</p>
                        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/candidate/applications/${promotedCandidate.id}" 
                               style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
                                View Offer
                            </a>
                        </div>
                    </div>
                `
                await transporter.sendMail({
                    from: `"HireX Careers" <${process.env.GMAIL_USER}>`,
                    to: newCandidateEmail,
                    subject: `Employment Offer: ${application.jobs.title}`,
                    html: htmlNewOffer
                })
            }

            // Notify Recruiter
            if (recruiterProfile?.email) {
                const statusColor = decision === 'accepted' ? '#10b981' : '#ef4444'

                await transporter.sendMail({
                    from: `"HireX System" <${process.env.GMAIL_USER}>`,
                    to: recruiterProfile.email,
                    subject: `Offer ${decision.toUpperCase()}: ${user.user_metadata?.full_name || user.email} for ${application.jobs.title}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                            <h2 style="color: #111827;">Offer Update</h2>
                            <p>Hi ${recruiterProfile.full_name || 'Recruiter'},</p>
                            <p>The candidate <strong>${user.user_metadata?.full_name || user.email}</strong> has 
                                <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${decision}</span> 
                                your employment offer for the <strong>${application.jobs.title}</strong> position.
                            </p>
                            ${decision === 'accepted' ? '<p>The candidate has been automatically moved to the <strong>Hired</strong> stage in your dashboard.</p>' : ''}
                            ${autoReplacementMessage}
                            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/recruiter/applications/${application.id}" 
                                   style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
                                    View Application details
                                </a>
                            </div>
                        </div>
                    `
                })
            }

            // 5. Send confirmation to candidate
            const htmlCandidate = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Response Confirmed</h2>
                    <p>Hi ${user.user_metadata?.full_name || 'there'},</p>
                    <p>This is a confirmation that you have <strong>${decision}</strong> the employment offer for the <strong>${application.jobs.title}</strong> position.</p>
                    ${decision === 'accepted' ? '<p>Our team will be in touch shortly with the next steps and onboarding information. Welcome aboard!</p>' : '<p>Thank you for your response. We wish you the best in your career journey.</p>'}
                    <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Best regards,<br>The HireX Team</p>
                </div>
            `

            await transporter.sendMail({
                from: `"HireX Careers" <${process.env.GMAIL_USER}>`,
                to: user.email,
                subject: `Confirmation: You ${decision} the offer for ${application.jobs.title}`,
                html: htmlCandidate
            })

        } catch (emailErr) {
            console.error("Failed to notify recruiter or candidate:", emailErr)
        }

        return NextResponse.json({
            success: true,
            message: `Offer ${decision} successfully`
        })
    } catch (error: any) {
        console.error("[Offer Response] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
