"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowRight, CheckCircle2, XCircle, Mail, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// import { format } from "date-fns" // Optional but helpful if installed. Using native string for now.

export type CandidateStatus = "new" | "screening" | "assessment" | "interview" | "shortlisted" | "offer" | "hired" | "rejected"

interface CandidateStatusControllerProps {
    candidateId: string
    currentStatus: string
    candidateType: "portal" | "email"
    candidateName: string
    candidateEmail?: string
    offerResponse?: string
    onUpdate: (newStatus?: string) => void
}

export default function CandidateStatusController({
    candidateId,
    currentStatus = "new",
    candidateType,
    candidateName,
    candidateEmail,
    offerResponse,
    onUpdate
}: CandidateStatusControllerProps) {
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [sendEmail, setSendEmail] = useState(true)
    const [actionType, setActionType] = useState<"advance" | "reject" | null>(null)
    const [emailSubject, setEmailSubject] = useState("")
    const [emailMessage, setEmailMessage] = useState("")
    const [interviewDate, setInterviewDate] = useState("")
    const [assessmentDate, setAssessmentDate] = useState("")
    const supabase = createClient()

    // Normalize status
    let normalizedStatus = currentStatus.toLowerCase()
    if (normalizedStatus === "pending" || normalizedStatus === "applied") {
        normalizedStatus = "new"
    }
    const status = normalizedStatus as CandidateStatus

    const getNextStage = (s: CandidateStatus): { label: string, target: CandidateStatus } | null => {
        switch (s) {
            case "new":
                return { label: "Screen Candidate", target: "screening" }
            case "screening":
                return { label: "Move to Assessment", target: "assessment" }
            case "assessment":
                return { label: "Move to Interview", target: "interview" }
            case "interview":
                return { label: "Shortlist Candidate", target: "shortlisted" }
            case "shortlisted":
                return { label: "Make Offer", target: "offer" }
            case "offer":
                return { label: "Mark as Hired", target: "hired" }
            default:
                return null
        }
    }

    const nextStage = getNextStage(status)
    const isTerminal = status === "hired" || status === "rejected"

    // Helper to get default content
    const getDefaultContent = (targetStatus: string, name: string) => {
        const companyName = "Hirex.ai"
        const cleanName = name.split(' ')[0]

        switch (targetStatus) {
            case "screening":
                return {
                    subject: `Update on your application - ${companyName}`,
                    message: `Good news! We've reviewed your application for ${companyName} and are excited to move you forward to the Screening stage.\n\nOur hiring team will be reviewing your details further and will reach out to schedule a brief conversation if there's a good match.`
                }
            case "assessment":
                return {
                    subject: `Assessment Invitation - ${companyName}`,
                    message: `Hi ${cleanName},\n\nWe are pleased to move you forward. As a next step, we would like you to complete a technical assessment.\n\nYou can access the assessment here: http://localhost:3000/candidate/assessment\n\nPlease complete it at your earliest convenience.`
                }
            case "interview":
                return {
                    subject: `Interview Invitation - ${companyName}`,
                    message: `Great news, ${cleanName}!\n\nWe were impressed with your profile and would like to officially invite you for an interview with our team.\n\nWe will contact you shortly to coordinate a time that works best for you. Please have your schedule ready!`
                }
            case "shortlisted":
                return {
                    subject: `Shortlisted for Selection - ${companyName}`,
                    message: `Dear ${cleanName},\n\nWe are happy to inform you that you have been shortlisted for the final selection round.\n\nOur team is currently finalizing the offer details and will reach out to you very soon.`
                }
            case "offer":
                return {
                    subject: `Employment Offer - ${companyName}`,
                    message: `Congratulations, ${cleanName}!\n\nWe are delighted to offer you a position at ${companyName}. We believe your skills and experience will be a fantastic addition to our mission.\n\nPlease log in to your candidate dashboard at ${window.location.origin}/candidate/applications to view the formal offer and accept/reject it.`
                }
            case "rejected":
                return {
                    subject: `Application Update - ${companyName}`,
                    message: `Hi ${cleanName},\n\nThank you for your interest in ${companyName}. After careful review, we've decided to move forward with other candidates who more closely match our current requirements.\n\nWe'll keep your profile in our pool for future opportunities that may be a fit. We wish you the best in your search.`
                }
            default:
                return {
                    subject: `Application Status Updated - ${companyName}`,
                    message: `Hello ${cleanName},\n\nThis is a quick update regarding your application at ${companyName}.\n\nYour current status has been updated to: ${targetStatus}.\n\nWe will provide further updates as your application progresses.`
                }
        }
    }

    const handleActionClick = (type: "advance" | "reject") => {
        setActionType(type)
        setSendEmail(true)
        setInterviewDate("") // Reset date on new action

        // Pre-fill email content
        let target = "rejected"
        if (type === "advance" && nextStage) {
            target = nextStage.target
        }
        const defaults = getDefaultContent(target, candidateName)
        setEmailSubject(defaults.subject)
        setEmailMessage(defaults.message)

        setIsDialogOpen(true)
    }

    // Effect to update email message when interview/assessment date is picked
    useEffect(() => {
        if (actionType === "advance" && nextStage?.target === "interview" && interviewDate) {
            const dateObj = new Date(interviewDate)
            const formattedDate = dateObj.toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

            const cleanName = candidateName.split(' ')[0]
            const companyName = "Hirex.ai"
            const newMessage = `Great news, ${cleanName}!\n\nWe were impressed with your profile and would like to officially invite you for an interview with our team.\n\nWe have scheduled it for: ${formattedDate}.\n\nPlease let us know if this time works for you.`

            setEmailMessage(newMessage)
        }

        if (actionType === "advance" && nextStage?.target === "assessment" && assessmentDate) {
            const dateObj = new Date(assessmentDate)
            const formattedDate = dateObj.toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

            const cleanName = candidateName.split(' ')[0]
            const companyName = "Hirex.ai"
            const link = `${window.location.origin}/candidate/assessment?id=${candidateId}`
            const newMessage = `Hi ${cleanName},\n\nWe are pleased to move you forward. As a next step, we would like you to complete a technical assessment.\n\nYou can access the assessment here: ${link}\n\nScheduled Date for Assessment: ${formattedDate}.\n\nGood luck!`

            setEmailMessage(newMessage)
        }
    }, [interviewDate, assessmentDate, actionType, nextStage, candidateName])

    const getCleanEmail = (emailStr: string) => {
        if (!emailStr) return ""
        const hashMatch = emailStr.match(/#<(.+?)>#/)
        if (hashMatch) return hashMatch[1]
        const angleMatch = emailStr.match(/<(.+?)>/)
        if (angleMatch) return angleMatch[1]
        return emailStr.trim()
    }

    const executeUpdate = async () => {
        if (!actionType) return

        let targetStatus = "rejected"
        if (actionType === "advance" && nextStage) {
            targetStatus = nextStage.target
        }

        // Validate Interview Date
        if (targetStatus === "interview" && !interviewDate) {
            toast.error("Please select an interview date and time.")
            return
        }

        setLoading(true)
        try {
            const table = candidateType === "portal" ? "applications" : "resumes"

            // Build update payload
            const updates: any = { status: targetStatus }
            if (targetStatus === "interview" && interviewDate) {
                updates.interview_date = new Date(interviewDate).toISOString()
            }
            if (targetStatus === "assessment" && assessmentDate) {
                updates.assessment_date = new Date(assessmentDate).toISOString()
            }
            if (targetStatus === "offer") {
                updates.offer_sent_at = new Date().toISOString()
                updates.offer_response = "pending"
            }

            const { data, error } = await supabase
                .from(table)
                .update(updates)
                .eq("id", candidateId)
                .select()

            if (error || !data || data.length === 0) {
                // If column doesn't exist (schema mismatch), try fallback to just status
                console.warn("Update failed, retrying with basic status update...", error)

                const basicUpdates = { status: targetStatus }
                const { error: retryError } = await supabase
                    .from(table)
                    .update(basicUpdates)
                    .eq("id", candidateId)

                if (retryError) {
                    throw error || new Error("Update failed completely")
                }

                toast.warning("Candidate moved, but extended details (dates/offer) couldn't be saved. Please run the database migration script.")
            }

            if (sendEmail && candidateEmail && candidateEmail !== "No Email") {
                const cleanEmail = getCleanEmail(candidateEmail)
                const companyName = "Hirex.ai"

                // Wrap the user-edited message in the HTML template
                const htmlContent = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
                        <h2 style="color: #2563eb; margin-top: 0;">Update from ${companyName}</h2>
                        <div style="font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${emailMessage}</div>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 14px; color: #718096;">
                            Best regards,<br>
                            <strong>The ${companyName} Recruitment Team</strong>
                        </div>
                    </div>
                `

                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: cleanEmail,
                        subject: emailSubject,
                        body: emailMessage, // Fallback plain text
                        html: htmlContent
                    })
                }).catch(err => console.error("Email send background error", err))
            }

            toast.success(`Candidate moved to ${targetStatus}`)
            setIsDialogOpen(false)
            onUpdate(targetStatus)
        } catch (error: any) {
            console.error("Update Error:", error)
            toast.error("Failed to update status: " + (error.message || "Unknown error"))
        } finally {
            setLoading(false)
        }
    }

    if (status === "offer" && offerResponse && offerResponse !== "pending") {
        return (
            <div className="space-y-4">
                <div className={cn(
                    "p-4 rounded-lg border-2 text-center font-bold flex flex-col items-center gap-2",
                    offerResponse === "accepted" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                )}>
                    {offerResponse === "accepted" ? (
                        <>
                            <CheckCircle2 className="h-6 w-6" />
                            <span>OFFER ACCEPTED</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-6 w-6" />
                            <span>OFFER REJECTED</span>
                        </>
                    )}
                </div>

                {offerResponse === "accepted" && nextStage && (
                    <Button
                        className="w-full h-12 justify-between px-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleActionClick("advance")}
                    >
                        <span className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Finalize Hiring
                        </span>
                        <span className="text-xs opacity-70 bg-black/20 px-2 py-1 rounded">Target: hired</span>
                    </Button>
                )}

                {offerResponse !== "rejected" && (
                    <Button
                        variant="outline"
                        className="w-full justify-start h-12 bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200 hover:border-rose-300"
                        onClick={() => handleActionClick("reject")}
                    >
                        <XCircle className="mr-3 h-4 w-4" /> {offerResponse === "accepted" ? "Cancel & Reject" : "Reject Candidate"}
                    </Button>
                )}
            </div>
        )
    }

    if (isTerminal) {
        return (
            <div className="p-4 bg-muted/50 rounded-lg border text-center">
                <p className="text-muted-foreground font-medium">
                    Candidate is <span className="capitalize text-foreground font-bold">{status}</span>
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {nextStage && (
                <Button
                    className={cn(
                        "w-full h-12 justify-between px-4",
                        status === "offer" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                    )}
                    onClick={() => handleActionClick("advance")}
                >
                    <span className="flex items-center">
                        {status === "offer" ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                        {nextStage.label}
                    </span>
                    <span className="text-xs opacity-70 bg-black/20 px-2 py-1 rounded">Next: {nextStage.target}</span>
                </Button>
            )}

            <Button
                variant="outline"
                className="w-full justify-start h-12 bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200 hover:border-rose-300"
                onClick={() => handleActionClick("reject")}
            >
                <XCircle className="mr-3 h-4 w-4" /> Reject Candidate
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "advance" && nextStage ? `Move to ${nextStage.target}?` : "Reject Candidate?"}
                        </DialogTitle>
                        <DialogDescription>
                            Review the details before confirming the status update.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Interview Date Picker */}
                        {actionType === "advance" && nextStage?.target === "interview" && (
                            <div className="space-y-2 border-b pb-4 mb-2">
                                <Label htmlFor="interview-date" className="text-sm font-bold flex items-center gap-2 text-indigo-600">
                                    <CalendarIcon className="h-4 w-4" />
                                    Schedule Interview
                                </Label>
                                <input
                                    id="interview-date"
                                    type="datetime-local"
                                    required
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={interviewDate}
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                />
                                <p className="text-[11px] text-muted-foreground">This date will be saved to your dashboard.</p>
                            </div>
                        )}

                        {actionType === "advance" && nextStage?.target === "assessment" && (
                            <div className="space-y-2 border-b pb-4 mb-2">
                                <Label htmlFor="assessment-date" className="text-sm font-bold flex items-center gap-2 text-indigo-600">
                                    <CalendarIcon className="h-4 w-4" />
                                    Schedule Assessment
                                </Label>
                                <input
                                    id="assessment-date"
                                    type="datetime-local"
                                    required
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={assessmentDate}
                                    onChange={(e) => setAssessmentDate(e.target.value)}
                                />
                                <p className="text-[11px] text-muted-foreground">This date will be saved to your dashboard.</p>
                            </div>
                        )}

                        <div className="flex items-center space-x-2 border p-4 rounded-md bg-muted/30">
                            <Checkbox
                                id="send-email"
                                checked={sendEmail}
                                onCheckedChange={(c) => setSendEmail(!!c)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="send-email" className="flex items-center gap-2 cursor-pointer font-medium">
                                    <Mail className="h-3 w-3" />
                                    Send email notification
                                </Label>
                            </div>
                        </div>

                        {sendEmail && (
                            <div className="space-y-3 animation-in slide-in-from-top-2 duration-200">
                                <div className="space-y-1">
                                    <Label htmlFor="subject">Subject</Label>
                                    <input
                                        id="subject"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="message">Message Body</Label>
                                    <textarea
                                        id="message"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={emailMessage}
                                        onChange={(e) => setEmailMessage(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant={actionType === "reject" ? "destructive" : "default"}
                            onClick={executeUpdate}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm {actionType === "advance" ? "Move & Send" : "Reject & Send"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
