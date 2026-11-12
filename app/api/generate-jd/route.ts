import { NextResponse } from "next/server"
import { generateJobDescription } from "@/lib/gemini"

export async function POST(req: Request) {
    try {
        const { title, skills, experience } = await req.json()

        if (!title) {
            return NextResponse.json(
                { error: "Job title is required" },
                { status: 400 }
            )
        }

        const description = await generateJobDescription(
            title,
            skills || [],
            experience || "Mid-Level"
        )
        return NextResponse.json({ description })
    } catch (error: any) {
        console.error("JD Generation API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate job description" },
            { status: 500 }
        )
    }
}
