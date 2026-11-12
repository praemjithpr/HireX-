"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertTriangle, CheckCircle, HelpCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SentimentAnalyzer() {
    const [emailText, setEmailText] = useState("")
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!emailText.trim()) return

        setLoading(true)
        try {
            const res = await fetch("/api/sentiment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailText }),
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setResult(data)
            toast.success("Analysis Complete!")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const getRiskColor = (risk: string) => {
        const r = risk?.toLowerCase() || ""
        if (r.includes("high")) return "bg-red-100 text-red-800 border-red-200"
        if (r.includes("medium")) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-green-100 text-green-800 border-green-200"
    }

    return (
        <Card className="w-full border-dashed border-2 bg-slate-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Engagement Analyzer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!result ? (
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Paste candidate's email response here to detect drop-off risk..."
                            className="min-h-[80px] text-xs bg-white"
                            value={emailText}
                            onChange={(e) => setEmailText(e.target.value)}
                        />
                        <Button
                            className="w-full h-8 text-xs"
                            size="sm"
                            onClick={handleAnalyze}
                            disabled={loading || !emailText}
                        >
                            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Analyze Engagement
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Drop-off Risk</span>
                            <Badge variant="outline" className={getRiskColor(result.dropOffRisk)}>
                                {result.dropOffRisk} Risk
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white p-2 rounded border">
                                <span className="block text-muted-foreground mb-1">Sentiment</span>
                                <span className="font-medium">{result.sentiment}</span>
                            </div>
                            <div className="bg-white p-2 rounded border">
                                <span className="block text-muted-foreground mb-1">Engagement</span>
                                <span className="font-medium">{result.engagementScore}%</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                            <h4 className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Recommended Action
                            </h4>
                            <p className="text-xs text-blue-700">
                                {result.recommendation}
                            </p>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-6 text-[10px] text-slate-400"
                            onClick={() => { setResult(null); setEmailText("") }}
                        >
                            Analyze Another
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
