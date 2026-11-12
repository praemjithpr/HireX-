import { NextResponse } from "next/server"
import { analyzeSentiment } from "@/lib/gemini"

export async function POST(req: Request) {
    try {
        const { emailText } = await req.json()

        if (!emailText) {
            return NextResponse.json({ error: "Email text is required" }, { status: 400 })
        }

        const result = await analyzeSentiment(emailText)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Sentiment API Error:", error)
        return NextResponse.json({ error: error.message || "Failed to analyze sentiment" }, { status: 500 })
    }
}
