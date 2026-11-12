"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Check, Loader2, Sparkles, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ComparisonModal({ isOpen, onClose, candidates }: any) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleCompare = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/compare-resumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    candidateA: candidates[0],
                    candidateB: candidates[1],
                }),
            })
            const data = await res.json()
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Reset when opened
    if (isOpen && !result && !loading) {
        handleCompare()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Candidate Comparison
                    </DialogTitle>
                    <DialogDescription>
                        Side-by-side analysis of selected candidates.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Analyzing resumes against job requirements...</p>
                    </div>
                ) : result ? (
                    <div className="grid grid-cols-2 gap-8 mt-4">
                        {/* Candidate A */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                                <Avatar>
                                    <AvatarFallback>{candidates[0].name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{candidates[0].name}</p>
                                    {result.winner === "Candidate A" && <span className="text-xs text-emerald-600 font-bold flex items-center"><Check className="w-3 h-3 mr-1" /> Recommended</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold uppercase text-slate-500">Key Strengths</h4>
                                <ul className="space-y-1">
                                    {result.candidateA_strengths?.map((s: string, i: number) => (
                                        <li key={i} className="text-sm p-2 bg-emerald-50/50 text-emerald-900 rounded border border-emerald-100/50 flex gap-2">
                                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Candidate B */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                                <Avatar>
                                    <AvatarFallback>{candidates[1].name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{candidates[1].name}</p>
                                    {result.winner === "Candidate B" && <span className="text-xs text-emerald-600 font-bold flex items-center"><Check className="w-3 h-3 mr-1" /> Recommended</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold uppercase text-slate-500">Key Strengths</h4>
                                <ul className="space-y-1">
                                    {result.candidateB_strengths?.map((s: string, i: number) => (
                                        <li key={i} className="text-sm p-2 bg-emerald-50/50 text-emerald-900 rounded border border-emerald-100/50 flex gap-2">
                                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Analysis Verdict</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {result.comparison}
                            </p>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
