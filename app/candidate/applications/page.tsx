import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export default async function CandidateApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get candidate's applications
  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(*)")
    .eq("candidate_id", user.id)
    .order("applied_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center px-6 py-4">
          <Link href="/candidate/dashboard">
            <Button variant="ghost" size="icon" className="mr-4 text-violet-700 hover:bg-violet-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-violet-600" />
            <span className="text-2xl font-bold text-violet-900">My Applications</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="border-violet-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-violet-900">{app.jobs?.title}</CardTitle>
                      <CardDescription className="text-violet-600">
                        {app.jobs?.department} • {app.jobs?.location}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {app.ats_score && (
                        <Badge
                          className={
                            app.ats_score >= 80
                              ? "bg-green-100 text-green-700"
                              : app.ats_score >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }
                        >
                          ATS: {app.ats_score}%
                        </Badge>
                      )}
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-violet-700">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                    <Link href={`/candidate/applications/${app.id}`}>
                      <Button variant="outline" className="border-violet-300 text-violet-700 bg-transparent">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardContent className="py-16 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-violet-300" />
              <h2 className="mb-2 text-2xl font-bold text-violet-900">No applications yet</h2>
              <p className="mb-6 text-violet-700">Start applying to jobs to see your applications here</p>
              <Link href="/candidate/jobs">
                <Button className="bg-violet-600 hover:bg-violet-700">Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
