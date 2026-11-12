"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Video, Mail, CheckCircle, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import LocalTimeDisplay from "@/components/local-time-display"
import { refreshDashboard } from "@/app/actions"

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
    const [scheduleDate, setScheduleDate] = useState("")
    const [scheduleTime, setScheduleTime] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        // Fetch Portal Apps
        const { data: apps } = await supabase
            .from("applications")
            .select("*, jobs(title), profiles(full_name, email)")
            .or("status.eq.interview,status.eq.screening") // Show both allowing specific move
            .order("applied_at", { ascending: false })

        // Fetch Email Apps
        const { data: emails } = await supabase
            .from("resumes")
            .select("*")
            .or("status.eq.interview,status.eq.screening")

        const unified = [
            ...(apps || []).map(a => ({
                id: a.id,
                type: 'portal',
                name: a.profiles?.full_name || "Unknown Candidate",
                email: a.profiles?.email,
                role: a.jobs?.title,
                status: a.status,
                interviewDate: a.interview_date,
                avatar: a.profiles?.full_name?.[0] || "U"
            })),
            ...(emails || []).map(e => ({
                id: e.id,
                type: 'email',
                name: e.sender_email.split('@')[0],
                email: e.sender_email,
                role: e.email_subject || "Email Application",
                status: e.status,
                interviewDate: e.interview_date,
                avatar: e.sender_email?.[0]?.toUpperCase() || "E"
            }))
        ]

        // Filter: Keep if status is 'interview' OR it already has a date set
        const filtered = unified.filter(c =>
            c.status?.toLowerCase() === 'interview' || c.interviewDate
        ).sort((a, b) => {
            // Put scheduled ones first
            if (a.interviewDate && !b.interviewDate) return -1
            if (!a.interviewDate && b.interviewDate) return 1
            // If both scheduled, sort by date ASC (soonest first)
            if (a.interviewDate && b.interviewDate) {
                return new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
            }
            return 0
        })

        setInterviews(filtered)
        setLoading(false)
    }

    const handleSchedule = async () => {
        if (!selectedCandidate || !scheduleDate || !scheduleTime) {
            toast.error("Please select both date and time")
            return
        }

        const fullDateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        let sbError = null

        // 1. Update Database
        if (selectedCandidate.type === 'portal') {
            const { error } = await supabase.from("applications").update({
                interview_date: fullDateTime,
                status: 'interview' // Ensure they are in interview stage
            }).eq("id", selectedCandidate.id)
            sbError = error
        } else {
            const { error } = await supabase.from("resumes").update({
                interview_date: fullDateTime,
                status: 'interview'
            }).eq("id", selectedCandidate.id)
            sbError = error
        }

        if (sbError) {
            console.error("Schedule Error:", sbError)
            toast.error(`Failed to update interview: ${sbError.message}`)
            return
        }

        // 2. Send Email via API
        const isReschedule = !!selectedCandidate.interviewDate
        const emailSubject = isReschedule
            ? `Updated: Interview Schedule for ${selectedCandidate.role} at Hirex.ai`
            : `Interview Invitation for ${selectedCandidate.role} at Hirex.ai`

        const emailBody = isReschedule
            ? `Hi ${selectedCandidate.name},\n\nWe have updated the time for your interview.\n\nNew Date: ${scheduleDate}\nNew Time: ${scheduleTime}\n\nPlease confirm if this works for you.\n\nBest,\nHirex Recruiting Team`
            : `Hi ${selectedCandidate.name},\n\nWe were impressed with your profile and would like to invite you for an interview with our team.\n\nDate: ${scheduleDate}\nTime: ${scheduleTime}\n\nPlease let us know if this time works for you.\n\nBest,\nHirex Recruiting Team`

        const htmlContent = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb;">${isReschedule ? "Interview Rescheduled" : "Interview Invitation"}</h2>
                <p>Hi ${selectedCandidate.name},</p>
                <p>${isReschedule
                ? "We have updated the time for your interview."
                : "We were impressed with your profile and would like to invite you for an interview with our team."
            }</p>
                <div style="background: #f8fafc; padding: 15px; margin: 15px 0; border-radius: 6px;">
                    <p style="margin: 5px 0;"><strong>${isReschedule ? "New Date" : "Date"}:</strong> ${scheduleDate}</p>
                    <p style="margin: 5px 0;"><strong>${isReschedule ? "New Time" : "Time"}:</strong> ${scheduleTime}</p>
                    <p style="margin: 5px 0;"><strong>Platform:</strong> Google Meet (Link will be shared)</p>
                </div>
                <p>Please let us know if this time works for you.</p>
                <p style="margin-top: 20px; color: #64748b; font-size: 14px;">Best regards,<br>Hirex Recruiting Team</p>
            </div>
        `

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedCandidate.email,
                    subject: emailSubject,
                    body: emailBody, // Fallback
                    html: htmlContent
                })
            })

            if (!res.ok) {
                console.error("Email API failed")
                toast.warning("Interview scheduled, but email sending failed.")
            } else {
                toast.success(isReschedule
                    ? `Rescheduled & Email Sent to ${selectedCandidate.name}`
                    : `Scheduled & Email Sent to ${selectedCandidate.name}`
                )
            }
        } catch (err) {
            console.error("Email fetch error", err)
            toast.warning("Interview scheduled, but email sending failed.")
        }

        await refreshDashboard() // Revalidate server cache
        setIsDialogOpen(false) // Close dialog
        fetchData() // Refresh list
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
                    <p className="text-muted-foreground">Manage and track your upcoming candidate interviews.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center py-12">Loading interviews...</div>
                ) : interviews.length > 0 ? (
                    interviews.map((interview) => (
                        <Card key={`${interview.type}-${interview.id}`} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                                {interview.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold">{interview.name}</h3>
                                            <p className="text-sm text-muted-foreground">{interview.role}</p>

                                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                {interview.interviewDate ? (
                                                    <div className="flex items-center text-emerald-600 font-medium">
                                                        <Clock className="mr-1.5 h-4 w-4" />
                                                        <LocalTimeDisplay date={interview.interviewDate} format="datetime" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-orange-600 font-medium">
                                                        <Clock className="mr-1.5 h-4 w-4" />
                                                        <span>Not Scheduled Yet</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <Video className="mr-1.5 h-4 w-4" />
                                                    <span>Google Meet</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {interview.interviewDate ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                <CheckCircle className="w-3 h-3 mr-1 text-emerald-700" /> Scheduled
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                                Action Required
                                            </Badge>
                                        )}

                                        <Dialog open={isDialogOpen && selectedCandidate?.id === interview.id} onOpenChange={(open) => {
                                            setIsDialogOpen(open)
                                            if (open) setSelectedCandidate(interview)
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant={interview.interviewDate ? "outline" : "default"}>
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {interview.interviewDate ? "Reschedule" : "Schedule Interview"}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Schedule Interview with {interview.name}</DialogTitle>
                                                    <DialogDescription>
                                                        Pick a time. We will update the status and send an email automatically.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="grid gap-2">
                                                            <Label>Date</Label>
                                                            <Input type="date" onChange={(e) => setScheduleDate(e.target.value)} />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label>Time</Label>
                                                            <Input type="time" onChange={(e) => setScheduleTime(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleSchedule}>
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        Schedule & Send Email
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
                        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No Interviews Found</h3>
                        <p>Move candidates to the "Interview" stage to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
