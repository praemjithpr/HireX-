"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ResumeSummaryCard({ candidateId, type, initialData }: any) {
    const [summary, setSummary] = useState<any>(initialData || null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!summary && !loading) {
            fetchSummary()
        }
    }, [])

    const fetchSummary = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/resume-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ candidateId, type })
            })
            const data = await res.json()
            if (data.summary) {
                setSummary(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="border-indigo-100 bg-indigo-50/30">
                <CardContent className="pt-6 flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </CardContent>
            </Card>
        )
    }

    if (!summary) return null

    return (
        <Card className="border-indigo-100 bg-indigo-50/30">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" /> Executive Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {summary.summary}
                </p>

                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {summary.topSkills?.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>

                {summary.redFlags?.length > 0 && (
                    <div className="pt-2 border-t border-indigo-100">
                        <p className="text-xs font-bold text-amber-600 mb-2 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Attention Points
                        </p>
                        <ul className="space-y-1">
                            {summary.redFlags.map((flag: string, i: number) => (
                                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    {flag}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
