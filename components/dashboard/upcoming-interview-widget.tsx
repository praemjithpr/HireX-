"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Clock } from "lucide-react"
import LocalTimeDisplay from "@/components/local-time-display"

export default function UpcomingInterviewWidget() {
    const [interview, setInterview] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                // Fetch Portal Apps with Interview
                const { data: apps } = await supabase
                    .from("applications")
                    .select("*, jobs(title), profiles(full_name)")
                    .not("interview_date", "is", null)
                    .gte("interview_date", new Date().toISOString())

                // Fetch Email Apps with Interview
                const { data: emails } = await supabase
                    .from("resumes")
                    .select("*")
                    .not("interview_date", "is", null)
                    .gte("interview_date", new Date().toISOString())

                const unified = [
                    ...(apps || []).map(a => ({
                        interviewDate: a.interview_date,
                        candidateName: a.profiles?.full_name || "Unknown Candidate",
                        type: 'portal'
                    })),
                    ...(emails || []).map(e => ({
                        interviewDate: e.interview_date,
                        candidateName: e.sender_email?.split('@')[0] || "Email Candidate",
                        type: 'email'
                    }))
                ].sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime())

                setInterview(unified[0] || null)
            } catch (e) {
                console.error("Widget Fetch Error", e)
            } finally {
                setLoading(false)
            }
        }

        fetchInterview()

        // Optional: Poll for updates every 30s to stay fresh without refresh
        const interval = setInterval(fetchInterview, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return null // Or a skeleton

    if (!interview) return null

    return (
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl shadow-xl transition-all hover:bg-white/15 group">
            <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Upcoming Interview
                </span>
                <span className="text-sm font-semibold text-white flex items-center gap-1">
                    <LocalTimeDisplay date={interview.interviewDate} format="short" /> • {interview.candidateName}
                </span>
            </div>
        </div>
    )
}
