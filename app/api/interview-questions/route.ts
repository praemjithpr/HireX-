import { createClient } from "@/lib/supabase/server"
import { generateInterviewQuestions } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json()

    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get application with job details
    const { data: application } = await supabase
      .from("applications")
      .select("*, jobs(*)")
      .eq("id", applicationId)
      .single()

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Check if user is the recruiter
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "recruiter" || application.jobs.created_by !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Generate interview questions using Gemini
    const questionsResult = await generateInterviewQuestions(
      application.jobs.title,
      application.jobs.description,
      application.cover_letter || "No additional information provided",
    )

    // Store questions in database
    const { error: insertError } = await supabase.from("interview_questions").insert({
      application_id: applicationId,
      questions: questionsResult.questions,
    })

    if (insertError) throw insertError

    return NextResponse.json(questionsResult)
  } catch (error) {
    console.error("[v0] Interview Questions Error:", error)
    return NextResponse.json({ error: "Failed to generate interview questions" }, { status: 500 })
  }
}
