import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MapPin, Users, Calendar, Briefcase, Share2 } from "lucide-react"

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single()

    if (!job) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/recruiter/jobs">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold">{job.title}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{job.department}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                            </div>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <Link href={`/recruiter/jobs/${job.id}/applications`}>
                                <Button variant="outline">
                                    <Users className="mr-2 h-4 w-4" />
                                    View Applications
                                </Button>
                            </Link>
                            <Button>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Job
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {job.description}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {job.requirements}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">Job Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge variant={job.status === "open" ? "default" : "secondary"}>
                                        {job.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Remote</span>
                                    <span className="text-sm text-muted-foreground">{job.is_remote ? "Yes" : "No"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{job.openings} Openings</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span>{job.job_type}</span>
                                </div>

                                {job.salary_range_min && (
                                    <div className="pt-2 border-t mt-2">
                                        <span className="text-sm font-medium">Salary Range</span>
                                        <p className="text-sm text-muted-foreground">
                                            ${job.salary_range_min.toLocaleString()} - ${job.salary_range_max?.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
