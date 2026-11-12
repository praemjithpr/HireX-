import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, TrendingUp, CheckCircle } from "lucide-react"
import { FunnelChart, TopJobsChart } from "./analytics-charts"
import { SourceBreakdownChart } from "../dashboard/dashboard-charts" // Reuse this

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Get profile to verify role
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (profile?.role !== "recruiter") {
        redirect("/candidate/dashboard")
    }

    // Fetch all applications for calculating metrics
    // We assume 'applications' table has 'job_id' and 'resumes' table doesn't link to jobs yet cleanly in this context without parsing
    // But for the purpose of this analytics page, we will focus on 'applications' which are linked to jobs 
    // AND 'resumes' as general pool source.

    // 1. Fetch apps linked to recruiter's jobs
    const { data: apps } = await supabase
        .from("applications")
        .select(`
            id, 
            status, 
            job_id,
            jobs!inner(title, created_by)
        `)
        .eq("jobs.created_by", user.id)

    // 2. Fetch email resumes
    const { count: emailCount } = await supabase
        .from("resumes")
        .select("id", { count: "exact" })

    const portalCount = apps?.length || 0
    const totalApplicants = portalCount + (emailCount || 0)

    // Calculate Metrics
    const statusCounts = new Map<string, number>()
    const jobCounts = new Map<string, number>()

    apps?.forEach(app => {
        // Funnel stats
        const status = app.status || "applied"
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1)

        // Job stats
        const jobTitle = Array.isArray(app.jobs) ? (app.jobs[0] as any)?.title : (app.jobs as any)?.title
        if (jobTitle) {
            jobCounts.set(jobTitle, (jobCounts.get(jobTitle) || 0) + 1)
        }
    })

    // Funnel Data Construction
    // Mapping various DB statuses to Funnel Stages
    const applied = (statusCounts.get("applied") || 0) + (statusCounts.get("new") || 0) + (emailCount || 0)
    // We include emails in 'applied' at top of funnel

    const screening = (statusCounts.get("screening") || 0) + (statusCounts.get("reviewed") || 0)
    const interview = (statusCounts.get("interview") || 0) + (statusCounts.get("scheduled") || 0)
    const offered = (statusCounts.get("offered") || 0) + (statusCounts.get("offer_sent") || 0)
    const hired = (statusCounts.get("hired") || 0)
    const rejected = (statusCounts.get("rejected") || 0)

    // Funnel visualization usually implies subset relation, but here we likely have disjoint states in DB
    // So we treat them as current states. 
    // A true funnel requires historical data (passed through state X), which we might not have fully tracked.
    // For now, we visualize current State Distribution as the Funnel, which is common in simple dashboards.

    const funnelData = [
        { stage: "Applied", count: applied },
        { stage: "Screening", count: screening },
        { stage: "Interview", count: interview },
        { stage: "Offer", count: offered },
        { stage: "Hired", count: hired },
    ]

    // Top Jobs Data
    const topJobsData = Array.from(jobCounts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

    // Rates
    const totalConsidered = portalCount // Only portal apps progress through these specific tracked stages usually
    const interviewRate = totalConsidered > 0 ? Math.round((interview / totalConsidered) * 100) : 0
    const hiringRate = totalConsidered > 0 ? Math.round((hired / totalConsidered) * 100) : 0

    // Active Jobs Count
    const { count: activeJobs } = await supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .eq("created_by", user.id)
        .eq("status", "open")

    const sourceData = [
        { name: "Portal", value: portalCount },
        { name: "Email", value: emailCount || 0 }
    ]

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Hiring Analytics</h1>
                <p className="text-muted-foreground">Insights into your recruitment funnel and performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApplicants}</div>
                        <p className="text-xs text-muted-foreground">All time volume</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeJobs || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently open positions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{interviewRate}%</div>
                        <p className="text-xs text-muted-foreground">Of portal applicants</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{hiringRate}%</div>
                        <p className="text-xs text-muted-foreground">Conversion to hire</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <FunnelChart data={funnelData} />
                <TopJobsChart data={topJobsData} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Reuse the Source Breakdown assuming it fits generic width */}
                <SourceBreakdownChart data={sourceData} />
            </div>
        </div>
    )
}

