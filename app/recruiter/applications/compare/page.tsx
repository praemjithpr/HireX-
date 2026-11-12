"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Loader2, Sparkles, Trophy } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function CompareContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        const ids = searchParams.getAll("ids")
        const types = searchParams.getAll("types")

        if (ids.length < 2) {
            setError("Please select at least 2 candidates to compare.")
            setLoading(false)
            return
        }

        const candidates = ids.map((id, index) => ({
            id,
            type: types[index] || "portal"
        }))

        const fetchComparison = async () => {
            try {
                const res = await fetch("/api/compare-resumes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ candidates }),
                })
                const data = await res.json()
                if (data.error) throw new Error(data.error)
                setResult(data)
            } catch (err: any) {
                setError(err.message || "Failed to generate comparison. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchComparison()
    }, [searchParams])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <Loader2 className="w-16 h-16 animate-spin text-indigo-600 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold mt-8 text-slate-800">Analyzing Candidates...</h2>
                <p className="text-slate-500 mt-2">Analyzing resumes and comparing profiles.</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-rose-600 font-medium text-lg mb-4">{error}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to List
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                        Candidate Comparison
                    </h1>
                    <p className="text-slate-500">Side-by-side analysis</p>
                </div>
            </div>

            {result && (
                <div className="grid gap-8">
                    {/* Winner / Best Candidate Section */}
                    {result.best_candidate && (
                        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="p-3 bg-white rounded-full shadow-sm">
                                    <Trophy className="w-8 h-8 text-yellow-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-indigo-900">Top Recommendation: {result.best_candidate}</CardTitle>
                                    <CardDescription className="text-indigo-700/80">
                                        Based on the job requirements and overall profile strength.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    )}

                    {/* Candidates Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {result.comparisons.map((comp: any, i: number) => (
                            <Card key={i} className={`h-full border-t-4 ${comp.name === result.best_candidate ? 'border-t-indigo-500 shadow-md transform scale-[1.02] transition-transform' : 'border-t-slate-300'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {comp.name}
                                        {comp.name === result.best_candidate && <Badge className="bg-indigo-600">Best Match</Badge>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 text-xs tracking-wider">Key Strengths</h4>
                                        <ul className="space-y-2">
                                            {comp.strengths.map((s: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm bg-emerald-50/50 p-2 rounded text-emerald-900 border border-emerald-100/50">
                                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <span className="leading-snug">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 text-xs tracking-wider">Potential Gaps</h4>
                                        <ul className="space-y-2">
                                            {comp.weaknesses.map((w: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm bg-rose-50/50 p-2 rounded text-rose-900 border border-rose-100/50">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                    <span className="leading-snug">{w}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Summary Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Executive Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {result.summary}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <CompareContent />
        </Suspense>
    )
}
