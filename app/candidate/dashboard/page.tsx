import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, FileText, Clock, CheckCircle, XCircle, Search } from "lucide-react"

export default async function CandidateDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "candidate") {
    redirect("/recruiter/dashboard")
  }

  // Get candidate's applications
  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(*)")
    .eq("candidate_id", user.id)
    .order("applied_at", { ascending: false })

  // Count by status
  const appliedCount = applications?.filter((app) => app.status === "applied").length || 0
  const inProcessCount =
    applications?.filter((app) => ["screening", "interview", "offered"].includes(app.status)).length || 0
  const hiredCount = applications?.filter((app) => app.status === "hired").length || 0
  const rejectedCount = applications?.filter((app) => app.status === "rejected").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-violet-600" />
            <span className="text-2xl font-bold text-violet-900">hirex.ai</span>
            <Badge className="ml-2 bg-violet-100 text-violet-700">Candidate</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/candidate/jobs">
              <Button variant="ghost" className="text-violet-700 hover:bg-violet-100">
                Browse Jobs
              </Button>
            </Link>
            <Link href="/candidate/applications">
              <Button variant="ghost" className="text-violet-700 hover:bg-violet-100">
                My Applications
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
          <h1 className="mb-2 text-3xl font-bold text-violet-900">Welcome back, {profile?.full_name || "Candidate"}</h1>
          <p className="text-violet-700">Track your applications and find your next opportunity</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link href="/candidate/jobs">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Search className="mr-2 h-4 w-4" />
              Browse Jobs
            </Button>
          </Link>
          <Link href="/candidate/applications">
            <Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              View Applications
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{applications?.length || 0}</div>
              <p className="text-xs text-violet-600">Jobs applied to</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">In Process</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{inProcessCount}</div>
              <p className="text-xs text-violet-600">Under review</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{hiredCount}</div>
              <p className="text-xs text-violet-600">Offers accepted</p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">{rejectedCount}</div>
              <p className="text-xs text-violet-600">Not selected</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="border-violet-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-violet-900">Recent Applications</CardTitle>
            <CardDescription className="text-violet-600">Track the status of your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-violet-100 p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-violet-900">{app.jobs?.title}</h3>
                      <p className="text-sm text-violet-600">
                        {app.jobs?.department} • {app.jobs?.location}
                      </p>
                      {app.ats_score && <p className="mt-1 text-sm text-violet-700">ATS Score: {app.ats_score}%</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          app.status === "hired"
                            ? "bg-green-100 text-green-700"
                            : app.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : app.status === "offered"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {app.status}
                      </Badge>
                      <Link href={`/candidate/applications/${app.id}`}>
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
                <FileText className="mx-auto mb-4 h-12 w-12 text-violet-300" />
                <p className="mb-4 text-violet-700">No applications yet</p>
                <Link href="/candidate/jobs">
                  <Button className="bg-violet-600 hover:bg-violet-700">Browse Available Jobs</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
