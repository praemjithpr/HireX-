import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface InterviewPrepGeneratorProps {
    candidateId: string
    candidateType: "portal" | "email"
}

export default function InterviewPrepGenerator({ candidateId, candidateType }: InterviewPrepGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/interview-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ candidateId, candidateType, difficulty: "mixed" }),
            })

            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()

            if (!data.questions || data.questions.length === 0) {
                throw new Error("No questions returned")
            }

            setQuestions(data.questions)
        } catch (error: any) {
            console.error("Generator Error:", error)
            toast.error(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && questions.length === 0) {
            handleGenerate()
        }
    }, [open])

    const copyToClipboard = () => {
        const text = questions.map((q) => q.question).join("\n")
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Copied to clipboard")
    }

    const reset = () => {
        // Optional: clear questions on close or keep them cached
        // setQuestions([]) 
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) reset();
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
                    <FileText className="mr-3 h-4 w-4" /> Generate Interview Questions
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Interview Questions</DialogTitle>
                    <DialogDescription>
                        Key questions tailored for this role.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col flex-1 overflow-hidden mt-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Loading questions...</span>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/20">
                                <div className="space-y-3">
                                    {questions.map((q, i) => (
                                        <div key={i} className="bg-card p-3 rounded border shadow-sm">
                                            <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="flex gap-2 mt-4 pt-2 border-t">
                                <Button onClick={copyToClipboard} className="w-full">
                                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                    Copy Questions
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
