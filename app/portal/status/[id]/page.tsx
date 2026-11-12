import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CheckCircle2, Clock, MapPin, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function CandidateStatusPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const id = params.id

    // Try fetching from applications (Portal)
    let { data: app } = await supabase
        .from("applications")
        .select("*, jobs(*), profiles(*)")
        .eq("id", id)
        .single()

    let candidate: any = null
    let job: any = null

    if (app) {
        candidate = {
            name: app.profiles?.full_name || "Candidate",
            status: app.status || "new",
            appliedAt: app.applied_at
        }
        job = app.jobs
    } else {
        // Try fetching from resumes (Email)
        const { data: resume } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", id)
            .single()

        if (resume) {
            candidate = {
                name: resume.sender_email.split("@")[0],
                status: resume.status || "new",
                appliedAt: resume.received_at
            }
            job = {
                title: resume.email_subject || "General Application",
                location: "Remote/Hybrid",
                type: "Full-time"
            }
        }
    }

    if (!candidate) return notFound()

    // Timeline Logic
    const stages = ["new", "screening", "interview", "offer", "hired"]
    const currentStageIndex = stages.indexOf(candidate.status.toLowerCase())

    // If status is "rejected", show special state
    const isRejected = candidate.status.toLowerCase() === "rejected"

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-3xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Application Status</h1>
                    <p className="text-slate-500">Track your journey with us in real-time.</p>
                </div>

                {/* Status Card */}
                <Card className="border-none shadow-lg overflow-hidden">
                    <div className="bg-primary h-2 w-full" />
                    <CardHeader className="bg-white pb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
                                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type || "Full-time"}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</span>
                                </div>
                            </div>
                            <Badge variant={isRejected ? "destructive" : "secondary"} className="text-sm px-3 py-1 capitalize">
                                {candidate.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="bg-white pt-0 pb-8">

                        {/* Timeline */}
                        <div className="relative mt-8">
                            {isRejected ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900">Application Update</h3>
                                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                                        Thank you for your interest. Unfortunately, we have decided to move forward with other candidates for this role.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-2">
                                        {stages.map((stage, idx) => {
                                            const isCompleted = idx < currentStageIndex
                                            const isCurrent = idx === currentStageIndex
                                            const isPending = idx > currentStageIndex

                                            return (
                                                <div key={stage} className="flex flex-col items-center relative z-10 group">
                                                    <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                            ${isCompleted ? "bg-primary border-primary text-white" : ""}
                            ${isCurrent ? "bg-white border-primary text-primary ring-4 ring-primary/20" : ""}
                            ${isPending ? "bg-slate-50 border-slate-200 text-slate-300" : ""}
                          `}>
                                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                                                            isCurrent ? <Clock className="w-6 h-6 animate-pulse" /> :
                                                                <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </div>
                                                    <span className={`
                            absolute top-12 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors
                            ${isCurrent ? "text-primary" : "text-slate-400"}
                          `}>
                                                        {stage}
                                                    </span>
                                                </div>
                                            )
                                        })}

                                        {/* Progress Bar Background */}
                                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0" />

                                        {/* Active Progress Bar */}
                                        <div
                                            className="absolute top-5 left-0 h-0.5 bg-primary -z-0 transition-all duration-500"
                                            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                                        />
                                    </div>

                                    {/* Current Stage Details */}
                                    <div className="mt-12 bg-slate-50 rounded-lg p-6 border border-slate-100">
                                        <h4 className="font-semibold text-slate-900 mb-2 capitalize">Current Stage: {candidate.status}</h4>
                                        <p className="text-slate-500 text-sm">
                                            {candidate.status === "new" && "Your application has been received and is waiting for review."}
                                            {candidate.status === "screening" && "We are currently reviewing your profile and skills."}
                                            {candidate.status === "interview" && "Congratulations! You have been selected for an interview. We will contact you shortly."}
                                            {candidate.status === "offer" && "We are preparing your offer letter!"}
                                            {candidate.status === "hired" && "Welcome aboard! 🎉"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400">
                    Powered by HireX
                </p>
            </div>
        </div>
    )
}
