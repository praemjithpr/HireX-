import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, FileText, Calendar, Download } from "lucide-react"
import ATSScoreButton from "./ats-score-button"
import InterviewQuestionsButton from "./interview-questions-button"
import UpdateStatusForm from "./update-status-form"

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get application details
  const { data: application } = await supabase
    .from("applications")
    .select("*, jobs(*), profiles!applications_candidate_id_fkey(*)")
    .eq("id", id)
    .single()

  if (!application) {
    notFound()
  }

  // Check if user is the recruiter
  if (application.jobs.created_by !== user.id) {
    redirect("/recruiter/dashboard")
  }

  // Get interview questions if they exist
  const { data: interviewQuestions } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("application_id", id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center px-6 py-4">
          <Link href="/recruiter/applications">
            <Button variant="ghost" size="icon" className="mr-4 text-violet-700 hover:bg-violet-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-2xl font-bold text-violet-900">Application Details</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Candidate Info */}
            <Card className="border-violet-200 bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-violet-900">
                      {application.profiles?.full_name || "Candidate"}
                    </CardTitle>
                    <CardDescription className="text-violet-600">{application.profiles?.email}</CardDescription>
                  </div>
                  <Badge
                    className={
                      application.status === "hired"
                        ? "bg-green-100 text-green-700"
                        : application.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : application.status === "offered"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-violet-900">Applied For</h3>
                  <p className="text-violet-700">{application.jobs.title}</p>
                  <p className="text-sm text-violet-600">
                    {application.jobs.department} • {application.jobs.location}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-violet-900">Applied Date</h3>
                  <p className="text-violet-700">{new Date(application.applied_at).toLocaleDateString()}</p>
                </div>
                {application.profiles?.phone && (
                  <div>
                    <h3 className="mb-2 font-semibold text-violet-900">Phone</h3>
                    <p className="text-violet-700">{application.profiles.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.cover_letter && (
              <Card className="border-violet-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-violet-900">
                    <FileText className="h-5 w-5" />
                    Cover Letter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-violet-700 leading-relaxed">{application.cover_letter}</p>
                </CardContent>
              </Card>
            )}

            {/* ATS Analysis */}
            {application.ai_analysis && (
              <Card className="border-violet-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-violet-900">AI Analysis</CardTitle>
                  <CardDescription className="text-violet-600">Powered by Gemini AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold text-violet-900">Analysis</h3>
                    <p className="text-violet-700 leading-relaxed">{application.ai_analysis.analysis}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-violet-900">Strengths</h3>
                    <ul className="list-disc space-y-1 pl-5">
                      {application.ai_analysis.strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="text-violet-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-violet-900">Areas for Improvement</h3>
                    <ul className="list-disc space-y-1 pl-5">
                      {application.ai_analysis.weaknesses?.map((weakness: string, idx: number) => (
                        <li key={idx} className="text-violet-700">
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Questions */}
            {interviewQuestions && (
              <Card className="border-violet-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-violet-900">AI-Generated Interview Questions</CardTitle>
                  <CardDescription className="text-violet-600">
                    Personalized for this candidate • Powered by Gemini AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interviewQuestions.questions.map(
                      (q: { question: string; category: string; difficulty: string }, idx: number) => (
                        <div key={idx} className="rounded-lg border border-violet-100 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                              {q.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                q.difficulty === "hard"
                                  ? "border-red-300 text-red-700"
                                  : q.difficulty === "medium"
                                    ? "border-yellow-300 text-yellow-700"
                                    : "border-green-300 text-green-700"
                              }
                            >
                              {q.difficulty}
                            </Badge>
                          </div>
                          <p className="text-violet-900">{q.question}</p>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* ATS Score */}
            <Card className="border-violet-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-violet-900">ATS Score</CardTitle>
              </CardHeader>
              <CardContent>
                {application.ats_score ? (
                  <div className="text-center">
                    <div
                      className={`mb-2 text-4xl font-bold ${
                        application.ats_score >= 80
                          ? "text-green-600"
                          : application.ats_score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {application.ats_score}%
                    </div>
                    <p className="text-sm text-violet-600">Match Score</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-sm text-violet-600">Generate AI-powered ATS score</p>
                    <ATSScoreButton applicationId={id} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-violet-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-violet-900">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.resume_url && (
                  <a href={application.resume_url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Resume
                    </Button>
                  </a>
                )}
                {!interviewQuestions && <InterviewQuestionsButton applicationId={id} />}
                <Link href={`/recruiter/templates?applicationId=${id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </Link>
                {application.interview_date && (
                  <div className="rounded-lg bg-violet-50 p-3">
                    <div className="flex items-center gap-2 text-sm text-violet-700">
                      <Calendar className="h-4 w-4" />
                      <span>Interview: {new Date(application.interview_date).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card className="border-violet-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-violet-900">Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <UpdateStatusForm applicationId={id} currentStatus={application.status} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
