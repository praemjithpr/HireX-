
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper to calculate Overall Rating (matching frontend logic)
function calculateOverallRating(score: number, id: string) {
    const idNum = String(id).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    const variance = (idNum % 15) - 7
    let overall = (score || 0) + variance
    if (overall > 100) overall = 100
    if (overall < 0) overall = 0
    return overall
}

export async function POST(request: Request) {
    try {
        const { jobId, status, shortlistCount } = await request.json()
        const supabase = await createClient()

        // 1. Update Job Status
        const { error: jobError } = await supabase
            .from("jobs")
            .update({ status: status })
            .eq("id", jobId)

        if (jobError) throw jobError

        // 2. Handle Side Effects
        if (status === 'in_process') {
            // Fetch all applications for this job
            const { data: apps } = await supabase
                .from("applications")
                .select("id, ats_score, status")
                .eq("job_id", jobId)
                // Only process new/pending candidates to avoid re-rejecting hired ones? 
                // Or process all pending? Usually we want to shortlist from the "pool".
                // Let's grab all non-hired/non-rejected to be safe, or just all pending.
                .in("status", ["pending", "applied", "New"])

            if (apps && apps.length > 0) {
                const scoredApps = apps.map(app => ({
                    ...app,
                    overallRating: calculateOverallRating(app.ats_score, app.id)
                }))

                const updates = []

                if (shortlistCount && shortlistCount > 0) {
                    // --- Logic A: Shortlist Top N ---
                    // Sort by Overall Rating DESC
                    scoredApps.sort((a, b) => b.overallRating - a.overallRating)

                    const topN = scoredApps.slice(0, shortlistCount)
                    const others = scoredApps.slice(shortlistCount)

                    // Promote Top N to 'screening'
                    topN.forEach(app => {
                        updates.push({ id: app.id, status: 'screening' })
                    })

                    // Reject the rest
                    others.forEach(app => {
                        updates.push({ id: app.id, status: 'rejected' })
                    })

                } else {
                    // --- Logic B: Fallback (Reject < 65) ---
                    for (const app of scoredApps) {
                        if (app.overallRating < 65) {
                            updates.push({ id: app.id, status: 'rejected' })
                        } else {
                            updates.push({ id: app.id, status: 'screening' })
                        }
                    }
                }

                // Perform Bulk Updates
                await Promise.all(updates.map(u =>
                    supabase.from("applications").update({ status: u.status }).eq("id", u.id)
                ))
            }
        } else if (status === 'closed') {
            // Reject all non-hired candidates
            // "closed should reject all candidates" -> assuming active ones
            await supabase
                .from("applications")
                .update({ status: 'rejected' })
                .eq("job_id", jobId)
                .neq("status", "hired")
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Status update failed:", error)
        return NextResponse.json({ error: (error as Error).message || "Failed to update status" }, { status: 500 })
    }
}
