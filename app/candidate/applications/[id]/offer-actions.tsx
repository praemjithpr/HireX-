"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface OfferActionsProps {
    applicationId: string
    jobTitle: string
    currentResponse?: string
}

export default function OfferActions({ applicationId, jobTitle, currentResponse }: OfferActionsProps) {
    const [loading, setLoading] = useState(false)
    const [decision, setDecision] = useState<string | undefined>(currentResponse)
    const router = useRouter()

    const handleDecision = async (type: 'accepted' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${type} this employment offer for ${jobTitle}?`)) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/candidate/respond-offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId, decision: type })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setDecision(type)
            toast.success(`You have ${type} the offer. Notification sent to the recruiter.`)
            router.refresh()
        } catch (error: any) {
            toast.error("Failed to submit decision: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (decision && decision !== 'pending') {
        return (
            <Card className={`border-2 ${decision === 'accepted' ? 'border-emerald-500 bg-emerald-50/30' : 'border-rose-500 bg-rose-50/30'}`}>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-3">
                        {decision === 'accepted' ? (
                            <>
                                <div className="p-3 bg-emerald-100 rounded-full">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-emerald-800">Offer Accepted!</h3>
                                    <p className="text-emerald-700/80 max-w-sm mx-auto mt-1">
                                        Congratulations! You've accepted the offer for <strong>{jobTitle}</strong>.
                                        The hiring team has been notified and will reach out with the next steps.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-rose-100 rounded-full">
                                    <XCircle className="w-8 h-8 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-rose-800">Offer Declined</h3>
                                    <p className="text-rose-700/80 max-w-sm mx-auto mt-1">
                                        You have declined the offer for <strong>{jobTitle}</strong>.
                                        Thank you for your response.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border bg-card shadow-sm border-2 border-primary overflow-hidden">
            <div className="bg-primary/10 px-6 py-4 flex items-center justify-between border-b border-primary/20">
                <h3 className="font-bold text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Official Employment Offer
                </h3>
                <Badge className="bg-primary text-primary-foreground animate-pulse">Action Required</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <p className="text-foreground leading-relaxed">
                        Congratulations! The hiring team has extended an official employment offer for the <strong>{jobTitle}</strong> position.
                        Please review the details shared in your interview and email, and provide your decision below.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <Button
                            className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
                            onClick={() => handleDecision('accepted')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Accept Offer
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold flex items-center justify-center gap-2"
                            onClick={() => handleDecision('rejected')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                            Decline Offer
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function FileText(props: any) {
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
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}
