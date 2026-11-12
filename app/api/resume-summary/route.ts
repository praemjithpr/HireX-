import { NextResponse } from "next/server"
import { summarizeResume } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
    try {
        const { candidateId, type } = await req.json()
        const supabase = await createClient()

        let resumeText = ""

        if (type === "portal") {
            const { data: app } = await supabase
                .from("applications")
                .select("*, application_data")
                .eq("id", candidateId)
                .single()

            if (app) {
                resumeText = JSON.stringify(app.application_data || {})
            }
        } else {
            const { data: res } = await supabase
                .from("resumes")
                .select("*")
                .eq("id", candidateId)
                .single()

            if (res) {
                resumeText = res.resume_text_content || ""
            }
        }

        if (!resumeText) {
            return NextResponse.json(
                { error: "Resume content not found" },
                { status: 404 }
            )
        }

        const result = await summarizeResume(resumeText)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Resume Summary API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to summarize resume" },
            { status: 500 }
        )
    }
}
