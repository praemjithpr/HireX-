import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, MapPin, Building, Plus, Briefcase, Mail, Phone, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/auth/login")

    // Fetch company details
    const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single()

    if (!company) notFound()

    // Fetch active jobs for this company (Assuming we start linking jobs via company_id or string match)
    // Since we just added company_id column, it might be empty. 
    // We can also match by company_name string if company_id is null.
    const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .or(`company_id.eq.${id},company_name.eq.${company.name}`)
        .eq("status", "open")

    return (
        <div className="container mx-auto px-6 py-8">
            <Link href="/recruiter/companies">
                <Button variant="ghost" className="mb-6 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
                </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Company Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-start gap-6">
                        <div className="h-24 w-24 rounded-xl border bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                            {company.logo_url ? (
                                <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                            ) : (
                                <Building className="h-10 w-10 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{company.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-sm font-medium">
                                    {company.industry || "General"}
                                </Badge>
                                {company.location && (
                                    <span className="text-muted-foreground text-sm flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" /> {company.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>About Company</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {company.about || "No description provided."}
                            </p>

                            {company.website && (
                                <div className="pt-4 mt-4 border-t">
                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                                        <Globe className="h-4 w-4 mr-2" />
                                        Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Partner Requirements & Notes</CardTitle>
                            <CardDescription>Internal notes on hiring requirements for this partner.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">
                                {company.requirements || "No specific requirements listed."}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Jobs Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4 mt-8">
                            <h2 className="text-xl font-bold">Active Jobs</h2>
                            <Link href={`/recruiter/jobs/new?company_id=${company.id}&company_name=${encodeURIComponent(company.name)}`}>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Post Job for {company.name}
                                </Button>
                            </Link>
                        </div>

                        {jobs && jobs.length > 0 ? (
                            <div className="grid gap-4">
                                {jobs.map((job: any) => (
                                    <Link href={`/recruiter/jobs/${job.id}`} key={job.id}>
                                        <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{job.location} • {job.job_type}</p>
                                                </div>
                                                <Badge variant="outline">{job.status}</Badge>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No active jobs for this company.</p>
                                    <Link href={`/recruiter/jobs/new?company_id=${company.id}&company_name=${encodeURIComponent(company.name)}`} className="text-primary hover:underline text-sm font-medium mt-1 inline-block">
                                        Create the first one
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Right Column: Key Stats / Contact */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href={`/recruiter/jobs/new?company_id=${company.id}&company_name=${encodeURIComponent(company.name)}`}>
                                <Button className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Create Job Posting
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full">
                                Edit Profile
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-muted-foreground">contact@{company.website?.replace(/^https?:\/\//, '').split('/')[0] || 'example.com'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
