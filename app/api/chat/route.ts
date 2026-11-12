import { chatWithGemini } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const response = await chatWithGemini(message, context)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("[v0] Chat Error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
