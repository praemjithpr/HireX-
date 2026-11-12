import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { applicationId, templateData } = await request.json()

    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get application details
    const { data: application } = await supabase
      .from("applications")
      .select("*, jobs(*), profiles!applications_candidate_id_fkey(*)")
      .eq("id", applicationId)
      .single()

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Get appointment letter template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_type", "appointment_letter")
      .single()

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Replace placeholders in template
    let letterContent = template.body
    letterContent = letterContent.replace(/\{\{issue_date\}\}/g, new Date().toLocaleDateString())
    letterContent = letterContent.replace(/\{\{candidate_name\}\}/g, application.profiles?.full_name || "Candidate")
    letterContent = letterContent.replace(/\{\{job_title\}\}/g, application.jobs.title)
    letterContent = letterContent.replace(/\{\{start_date\}\}/g, templateData.startDate || "TBD")
    letterContent = letterContent.replace(/\{\{department\}\}/g, application.jobs.department)
    letterContent = letterContent.replace(/\{\{reporting_manager\}\}/g, templateData.reportingManager || "TBD")
    letterContent = letterContent.replace(/\{\{employment_type\}\}/g, application.jobs.job_type)
    letterContent = letterContent.replace(/\{\{salary\}\}/g, application.jobs.salary_range || "TBD")
    letterContent = letterContent.replace(/\{\{location\}\}/g, application.jobs.location)
    letterContent = letterContent.replace(/\{\{job_responsibilities\}\}/g, application.jobs.description)
    letterContent = letterContent.replace(/\{\{working_hours\}\}/g, templateData.workingHours || "9 AM - 6 PM")
    letterContent = letterContent.replace(/\{\{recruiter_name\}\}/g, templateData.recruiterName || "Recruitment Team")
    letterContent = letterContent.replace(/\{\{recruiter_title\}\}/g, templateData.recruiterTitle || "HR Manager")

    // In a real application, you would generate a PDF here using a library like jsPDF or puppeteer
    // For now, we'll return the formatted content
    return NextResponse.json({
      success: true,
      content: letterContent,
      candidateName: application.profiles?.full_name,
    })
  } catch (error) {
    console.error("[v0] Generate Appointment Letter Error:", error)
    return NextResponse.json({ error: "Failed to generate appointment letter" }, { status: 500 })
  }
}
