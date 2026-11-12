import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Users, Clock, ArrowLeft, DollarSign } from "lucide-react"
import ApplyForm from "./apply-form"

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get job details
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single()

  if (!job) {
    notFound()
  }

  // Check if user already applied
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", id)
    .eq("candidate_id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center px-6 py-4">
          <Link href="/candidate/jobs">
            <Button variant="ghost" size="icon" className="mr-4 text-violet-700 hover:bg-violet-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-2xl font-bold text-violet-900">Job Details</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-violet-200 bg-white shadow-lg">
              <CardHeader>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2 text-2xl text-violet-900">{job.title}</CardTitle>
                    <CardDescription className="text-lg text-violet-600">{job.department}</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{job.openings} openings</Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-violet-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{job.job_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="capitalize">{job.experience_level} level</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-violet-900">Job Description</h3>
                  <p className="whitespace-pre-wrap text-violet-700 leading-relaxed">{job.description}</p>
                </div>

                {job.skills_required && job.skills_required.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-violet-900">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-violet-100 text-violet-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            {existingApplication ? (
              <Card className="border-violet-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-violet-900">Already Applied</CardTitle>
                  <CardDescription className="text-violet-600">
                    You have already submitted an application for this position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/candidate/applications">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">View My Applications</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <ApplyForm jobId={id} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
