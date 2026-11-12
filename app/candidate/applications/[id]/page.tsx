import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    MapPin,
    MessageSquare,
    Briefcase,
    Building,
    UserCheck,
} from "lucide-react"
import OfferActions from "./offer-actions"

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Get application details with job info
    const { data: application } = await supabase
        .from("applications")
        .select("*, jobs(*)")
        .eq("id", id)
        .single()

    if (!application) {
        notFound()
    }

    // Ensure the candidate owns this application
    if (application.candidate_id !== user.id) {
        redirect("/candidate/applications")
    }

    // Helper to determine stepper status
    const getStepStatus = (step: string) => {
        const steps = ["applied", "screening", "assessment", "interview", "shortlisted", "offer", "hired"]
        const currentStepIndex = steps.indexOf(application.status === "offered" ? "offer" : application.status)
        const stepIndex = steps.indexOf(step)

        if (application.status === "rejected") {
            return step === "applied" ? "completed" : "inactive" // Simplification for rejected
        }

        if (currentStepIndex > stepIndex) return "completed"
        if (currentStepIndex === stepIndex) return "current"
        return "inactive"
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto flex items-center px-6 py-4">
                    <Link href="/candidate/applications">
                        <Button variant="ghost" size="icon" className="mr-4 hover:bg-accent hover:text-accent-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <span className="text-xl font-bold text-foreground block">Application Status</span>
                        <span className="text-sm text-muted-foreground">{application.jobs.title}</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Progress & Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status Progress Stepper */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-foreground">Application Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative flex justify-between">
                                    {/* Connecting Line */}
                                    <div className="absolute top-4 left-0 w-full h-1 bg-secondary -z-10"></div>

                                    {/* Steps */}
                                    {[
                                        { id: "applied", label: "Applied", icon: FileText },
                                        { id: "screening", label: "Screening", icon: SearchIcon },
                                        { id: "assessment", label: "Assessment", icon: CheckCircle2 },
                                        { id: "interview", label: "Interview", icon: MessageSquare },
                                        { id: "interview", label: "Interview", icon: MessageSquare },
                                        { id: "shortlisted", label: "Shortlisted", icon: UserCheck },
                                        { id: "offer", label: "Offer", icon: FileText },
                                        { id: "hired", label: "Hired", icon: Briefcase }
                                    ].map((step, index) => {
                                        const status = getStepStatus(step.id);
                                        const isCompleted = status === "completed";
                                        const isCurrent = status === "current";

                                        // Handle Rejection Special Case visually if needed, otherwise stick to linear
                                        // Ideally we'd have a 'rejected' step or state, but sticking to the requested flow

                                        return (
                                            <div key={step.id} className="flex flex-col items-center bg-card px-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                                    ${isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                                        isCurrent ? "bg-background border-primary text-primary" :
                                                            "bg-background border-muted text-muted-foreground"}`}>
                                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                                                </div>
                                                <span className={`text-xs mt-2 font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Rejection Alert */}
                                {application.status === "rejected" && (
                                    <div className="mt-8 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
                                        <p className="font-semibold">Application Status: Not Selected</p>
                                        <p className="text-sm mt-1">Thank you for your interest. Unfortunately, the team has decided not to proceed with your application at this time.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* What's Next / Current Status Context */}
                        {application.status !== "rejected" && application.status !== "hired" && (
                            <Card className="border-border bg-card shadow-sm border-l-4 border-l-primary">
                                <CardHeader>
                                    <CardTitle className="text-foreground flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        Current Stage: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {application.status === "applied" && "Your application has been received. The recruiting team will review your profile shortly."}
                                        {application.status === "screening" && "Your application is currently being reviewed by the hiring team."}
                                        {application.status === "assessment" && "It's time for your technical assessment! Click the button below to start."}
                                        {application.status === "assessment" && "It's time for your technical assessment! Click the button below to start."}
                                        {application.status === "interview" && "Congratulations! You have been selected for an interview. Check the details below."}
                                        {application.status === "shortlisted" && "You have been shortlisted! The team is finalizing the offer details."}
                                        {application.status === "offer" && "Great news! You have received an offer. Please review the details below."}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Assessment Details (Conditional) */}
                        {application.status === "assessment" && (
                            <Card className="border-border bg-card shadow-sm border-2 border-primary">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-foreground flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                            Required Assessment
                                        </CardTitle>
                                        {application.assessment_status === "completed" ? (
                                            <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
                                        ) : (
                                            <Badge variant="outline" className="animate-pulse">Active</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {application.assessment_status === "completed"
                                                ? "You have successfully completed the assessment. The results have been shared with the recruitment team."
                                                : "Please complete the technical assessment to proceed further. The assessment includes 10 Multiple Choice Questions (MCQs) for the developer role."}
                                        </p>
                                    </div>

                                    {application.assessment_status !== "completed" ? (
                                        <Link href={`/candidate/assessment?id=${application.id}`}>
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6">
                                                Attend Assessment Now
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button disabled className="w-full">
                                            Assessment Completed
                                        </Button>
                                    )}

                                    {application.assessment_date && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            Recommended completion date: {new Date(application.assessment_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Interview Details (Conditional) */}
                        {application.interview_date && (
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-foreground flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Upcoming Interview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-4">
                                        <div className="p-3 bg-background rounded-full border border-border">
                                            <Clock className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {new Date(application.interview_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {new Date(application.interview_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Please be prepared 10 minutes before the scheduled time. Good luck!
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        {/* Offer Details (Conditional) */}
                        {application.status === "offer" && (
                            <OfferActions
                                applicationId={application.id}
                                jobTitle={application.jobs.title}
                                currentResponse={application.offer_response}
                            />
                        )}

                        {/* Application Data */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-foreground">Your Application</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {application.cover_letter && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground mb-2">Cover Letter</h3>
                                        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                            {application.cover_letter}
                                        </div>
                                    </div>
                                )}

                                {application.resume_url && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground mb-2">Resume</h3>
                                        <a href={application.resume_url} target="_blank" rel="noopener noreferrer" className="block">
                                            <Button variant="outline" className="w-full sm:w-auto bg-transparent border-input hover:bg-accent text-foreground">
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Resume
                                            </Button>
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Job Snapshot */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="border-border bg-card shadow-sm sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-foreground">Job Snapshot</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">{application.jobs.title}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                        <Building className="w-4 h-4" />
                                        <span>{application.jobs.department}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">{application.jobs.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground capitalize">{application.jobs.job_type}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">Posted {new Date(application.jobs.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <Link href={`/candidate/jobs/${application.jobs.id}`}>
                                    <Button className="w-full mt-4">View Job Details</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    )
}

function SearchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
