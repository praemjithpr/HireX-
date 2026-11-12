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
        console.log("Candidate responded to offer:", { decision, applicationId })

        return NextResponse.json({
            success: true,
            message: `Offer ${decision} successfully`
        })
    } catch (error: any) {
        console.error("[Offer Response] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
