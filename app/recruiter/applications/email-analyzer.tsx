"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Briefcase } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

export default function EmailAnalyzer({ resumeId, onAnalyzeComplete }: { resumeId: string, onAnalyzeComplete?: () => void }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [jobs, setJobs] = useState<any[]>([])
    const [selectedJob, setSelectedJob] = useState("")
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (open && jobs.length === 0) {
            fetchJobs()
        }
    }, [open])

    const fetchJobs = async () => {
        const { data } = await supabase.from("jobs").select("id, title").eq("status", "active")
        if (data) setJobs(data)
    }

    const handleAnalyze = async () => {
        if (!selectedJob) return
        setLoading(true)
        try {
            const res = await fetch("/api/ats-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeId, jobId: selectedJob }),
            })

            if (!res.ok) throw new Error("Analysis failed")

            toast.success("Resume Analyzed against Job")
            setOpen(false)
            router.refresh()
            if (onAnalyzeComplete) onAnalyzeComplete()
        } catch (error) {
            toast.error("Failed to analyze resume.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold"
                >
                    <Sparkles className="mr-2 h-3 w-3" /> Analyze Resume
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Analyze Resume Match</DialogTitle>
                    <DialogDescription>
                        Select a job to compare this resume against.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedJob}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a job role" />
                        </SelectTrigger>
                        <SelectContent>
                            {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button onClick={handleAnalyze} disabled={!selectedJob || loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate ATS Score
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
