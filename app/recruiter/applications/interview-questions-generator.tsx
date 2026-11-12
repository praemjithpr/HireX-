"use strict";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainCircuit, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function InterviewQuestionsGenerator({ jobTitle, jobDescription, resumeText }: any) {
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState<any[]>([])
    const [difficulty, setDifficulty] = useState("medium")
    const [copied, setCopied] = useState<number | null>(null)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/interview-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobTitle,
                    jobDescription,
                    candidateResume: resumeText,
                    difficulty
                }),
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setQuestions(data.questions)
            toast.success("Questions generated successfully!")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopied(index)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden mt-6">
            <CardHeader className="bg-indigo-50/50 border-b py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg font-bold text-slate-800">Interview Assistant</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                    <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Questions
                    </Button>
                </div>

                {questions.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {questions.map((q, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 group relative">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border">{q.category}</span>
                                            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{q.difficulty}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">{q.question}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => copyToClipboard(q.question, i)}
                                    >
                                        {copied === i ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
