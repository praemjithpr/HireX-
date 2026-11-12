import { createClient } from "@/lib/supabase/server"
import { generateATSScore } from "@/lib/gemini"
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

    // Generate ATS score using Gemini
    const atsResult = await generateATSScore(
      application.jobs.description,
      application.cover_letter || "No cover letter provided",
    )

    // Update application with ATS score and analysis
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        ats_score: atsResult.score,
        ai_analysis: {
          analysis: atsResult.analysis,
          strengths: atsResult.strengths,
          weaknesses: atsResult.weaknesses,
        },
      })
      .eq("id", applicationId)

    if (updateError) throw updateError

    return NextResponse.json(atsResult)
  } catch (error) {
    console.error("[v0] ATS Score Error:", error)
    return NextResponse.json({ error: "Failed to generate ATS score" }, { status: 500 })
  }
}
