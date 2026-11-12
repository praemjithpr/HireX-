import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, Plus, MapPin, Users, ArrowLeft } from "lucide-react"

export default async function JobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all jobs for this recruiter
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/recruiter/dashboard">
              <Button variant="ghost" size="icon" className="text-violet-700 hover:bg-violet-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-violet-600" />
              <span className="text-2xl font-bold text-violet-900">Job Postings</span>
            </div>
          </div>
          <Link href="/recruiter/jobs/new">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {jobs && jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job.id} className="border-violet-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="text-lg text-violet-900">{job.title}</CardTitle>
                    <Badge
                      className={
                        job.status === "open"
                          ? "bg-green-100 text-green-700"
                          : job.status === "closed"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-violet-600">{job.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-violet-700">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-violet-700">
                      <Users className="h-4 w-4" />
                      <span>{job.openings} openings</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/recruiter/jobs/${job.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/recruiter/jobs/${job.id}/applications`} className="flex-1">
                        <Button className="w-full bg-violet-600 hover:bg-violet-700">Applications</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardContent className="py-16 text-center">
              <Briefcase className="mx-auto mb-4 h-16 w-16 text-violet-300" />
              <h2 className="mb-2 text-2xl font-bold text-violet-900">No jobs posted yet</h2>
              <p className="mb-6 text-violet-700">Start by posting your first job opening</p>
              <Link href="/recruiter/jobs/new">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
