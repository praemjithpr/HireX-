import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Briefcase, MapPin, Users, Clock, ArrowLeft, Search } from "lucide-react"

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all open jobs
  let query = supabase.from("jobs").select("*").eq("status", "open").order("created_at", { ascending: false })

  // Search filter
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,department.ilike.%${params.search}%,location.ilike.%${params.search}%`,
    )
  }

  const { data: jobs } = await query

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/candidate/dashboard">
              <Button variant="ghost" size="icon" className="text-violet-700 hover:bg-violet-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-violet-600" />
              <span className="text-2xl font-bold text-violet-900">Browse Jobs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <Card className="mb-8 border-violet-200 bg-white shadow-lg">
          <CardContent className="pt-6">
            <form action="/candidate/jobs" method="get" className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
                <Input
                  name="search"
                  type="search"
                  placeholder="Search by job title, department, or location..."
                  defaultValue={params.search}
                  className="border-violet-200 pl-10 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {jobs && jobs.length > 0 ? (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="border-violet-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-xl text-violet-900">{job.title}</CardTitle>
                      <CardDescription className="text-violet-600">{job.department}</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{job.openings} openings</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
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
                    </div>
                    {job.salary_range && (
                      <p className="text-sm font-medium text-violet-900">Salary: {job.salary_range}</p>
                    )}
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-violet-700">{job.description}</p>

                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {job.skills_required.slice(0, 5).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-violet-100 text-violet-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Link href={`/candidate/jobs/${job.id}`}>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">View Details & Apply</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardContent className="py-16 text-center">
              <Briefcase className="mx-auto mb-4 h-16 w-16 text-violet-300" />
              <h2 className="mb-2 text-2xl font-bold text-violet-900">No jobs found</h2>
              <p className="text-violet-700">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
