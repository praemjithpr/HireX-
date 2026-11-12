"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FeedbackFormProps {
    candidateId: string
    candidateType: "portal" | "email"
    candidateName: string
}

export default function FeedbackForm({ candidateId, candidateType, candidateName }: FeedbackFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [rating, setRating] = useState(0)
    const [strengths, setStrengths] = useState("")
    const [weaknesses, setWeaknesses] = useState("")
    const [notes, setNotes] = useState("")

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a star rating")
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const payload: any = {
                interviewer_name: "Current Recruiter", // Hardcoded for hackathon demo
                rating,
                strengths,
                weaknesses,
                notes
            }

            // Link correctly based on type
            if (candidateType === "portal") {
                payload.recruit_id = candidateId
            } else {
                payload.resume_id = candidateId
            }

            const { error } = await supabase.from("feedback").insert(payload)

            if (error) throw error

            toast.success("Feedback Submitted Successfully!")
            setOpen(false)
            // Reset form
            setRating(0)
            setStrengths("")
            setWeaknesses("")
            setNotes("")
        } catch (error: any) {
            console.error(error)
            toast.error(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
                    <MessageSquare className="mr-3 h-4 w-4" /> Add Interview Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Interview Feedback</DialogTitle>
                    <DialogDescription>
                        Rate {candidateName}'s performance in the interview.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Star Rating */}
                    <div className="flex flex-col gap-2 items-center">
                        <Label>Overall Rating</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-colors ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                                >
                                    <Star className="w-8 h-8 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="strengths">Key Strengths</Label>
                        <Textarea
                            id="strengths"
                            placeholder="e.g. Communication, Python skills..."
                            value={strengths}
                            onChange={(e) => setStrengths(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="weaknesses">Areas for Improvement</Label>
                        <Textarea
                            id="weaknesses"
                            placeholder="e.g. System Design depth..."
                            value={weaknesses}
                            onChange={(e) => setWeaknesses(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
