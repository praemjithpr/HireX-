import { NextResponse } from "next/server"
import { compareCandidates } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
    try {
        const { candidates } = await req.json() // Expects array of { id, type }
        const supabase = await createClient()

        if (!candidates || !Array.isArray(candidates) || candidates.length < 2) {
            return NextResponse.json({ error: "At least 2 candidates required" }, { status: 400 })
        }

        const getResumeText = async (candidate: { id: string, type: string }) => {
            if (candidate.type === "portal") {
                const { data } = await supabase.from("applications").select("applications_data, profiles(full_name)").eq("id", candidate.id).single()
                // @ts-ignore
                const name = data?.profiles?.full_name || "Unknown"
                // @ts-ignore
                const text = JSON.stringify(data?.applications_data || {})
                return { id: candidate.id, name, resume: text }
            } else {
                const { data } = await supabase.from("resumes").select("resume_text_content, sender_email").eq("id", candidate.id).single()
                const name = data?.sender_email?.split('@')[0] || "Unknown"
                const text = data?.resume_text_content || ""
                return { id: candidate.id, name, resume: text }
            }
        }

        const resumeData = await Promise.all(candidates.map(c => getResumeText(c)))

        // Get Job Description context if available (try to find one from portal candidates)
        let jobDescription = "General Role"
        for (const c of candidates) {
            if (c.type === "portal") {
                const { data } = await supabase.from("applications").select("jobs(description)").eq("id", c.id).single()
                // @ts-ignore
                if (data?.jobs?.description) {
                    // @ts-ignore
                    jobDescription = data.jobs.description
                    break
                }
            }
        }

        const result = await compareCandidates(jobDescription, resumeData)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Resume Comparison API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to compare resumes" },
            { status: 500 }
        )
    }
}
