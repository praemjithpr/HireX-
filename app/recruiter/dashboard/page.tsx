import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, Users, CheckCircle, XCircle, Clock, TrendingUp, Plus, FileText } from "lucide-react"

export default async function RecruiterDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get profile to verify role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "recruiter") {
    redirect("/candidate/dashboard")
  }

  // Get dashboard statistics
  const { data: jobs, count: totalJobs } = await supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("created_by", user.id)

  const { count: openJobs } = await supabase
    .from("jobs")
    .select("id", { count: "exact" })
    .eq("created_by", user.id)
    .eq("status", "open")

  const { data: applications, count: totalApplications } = await supabase
    .from("applications")
    .select("*, jobs!inner(*)", { count: "exact" })
    .eq("jobs.created_by", user.id)

  const { count: hiredCount } = await supabase
    .from("applications")
    .select("id", { count: "exact" })
    .eq("status", "hired")
    .in("job_id", jobs?.map((j) => j.id) || [])

  const { count: rejectedCount } = await supabase
    .from("applications")
    .select("id", { count: "exact" })
    .eq("status", "rejected")
    .in("job_id", jobs?.map((j) => j.id) || [])

  const { count: inProcessCount } = await supabase
    .from("applications")
    .select("id", { count: "exact" })
    .in("status", ["screening", "interview", "offered"])
    .in("job_id", jobs?.map((j) => j.id) || [])

  // Calculate average ATS score
  const applicationsWithScores = applications?.filter((app) => app.ats_score) || []
  const avgAtsScore =
    applicationsWithScores.length > 0
      ? Math.round(
          applicationsWithScores.reduce((sum, app) => sum + (app.ats_score || 0), 0) / applicationsWithScores.length,
        )
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-violet-600" />
            <span className="text-2xl font-bold text-violet-900">hirex.ai</span>
            <Badge className="ml-2 bg-violet-100 text-violet-700">Recruiter</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/recruiter/jobs">
              <Button variant="ghost" className="text-violet-700 hover:bg-violet-100">
                Jobs
              </Button>
            </Link>
            <Link href="/recruiter/applications">
              <Button variant="ghost" className="text-violet-700 hover:bg-violet-100">
                Applications
              </Button>
            </Link>
            <Link href="/recruiter/templates">
              <Button variant="ghost" className="text-violet-700 hover:bg-violet-100">
                Templates
              </Button>
            </Link>
            <form action="/api/auth/signout" method="post">
              <Button
                variant="outline"
                className="border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-violet-900">Welcome back, {profile?.full_name || "Recruiter"}</h1>
          <p className="text-violet-700">Here's your recruitment overview</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link href="/recruiter/jobs/new">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
          <Link href="/recruiter/applications">
            <Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent">
              <Users className="mr-2 h-4 w-4" />
              View Applications
            </Button>
          </Link>
          <Link href="/recruiter/templates">
            <Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Email Templates
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{totalJobs || 0}</div>
              <p className="text-xs text-violet-600">{openJobs || 0} currently open</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{totalApplications || 0}</div>
              <p className="text-xs text-violet-600">Across all jobs</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{hiredCount || 0}</div>
              <p className="text-xs text-violet-600">Successfully hired</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Avg ATS Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{avgAtsScore}%</div>
              <p className="text-xs text-violet-600">Candidate quality</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">In Process</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{inProcessCount || 0}</div>
              <p className="text-xs text-violet-600">Screening, Interview, Offered</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{hiredCount || 0}</div>
              <p className="text-xs text-violet-600">Successfully onboarded</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{rejectedCount || 0}</div>
              <p className="text-xs text-violet-600">Not a fit</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs */}
        <Card className="border-violet-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-violet-900">Recent Job Postings</CardTitle>
            <CardDescription className="text-violet-600">Your latest job openings</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border border-violet-100 p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-violet-900">{job.title}</h3>
                      <p className="text-sm text-violet-600">
                        {job.department} • {job.location} • {job.openings} openings
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={job.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      >
                        {job.status}
                      </Badge>
                      <Link href={`/recruiter/jobs/${job.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-violet-300 text-violet-700 bg-transparent"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-violet-300" />
                <p className="mb-4 text-violet-700">No jobs posted yet</p>
                <Link href="/recruiter/jobs/new">
                  <Button className="bg-violet-600 hover:bg-violet-700">Post Your First Job</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
