"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AnalyzeButton({ applicationId, onAnalyzeComplete }: { applicationId: string, onAnalyzeComplete?: () => void }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/ats-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId }),
            })

            if (!res.ok) throw new Error("Analysis failed")

            toast.success("Skill Analysis Completed")
            router.refresh()
            if (onAnalyzeComplete) onAnalyzeComplete()
        } catch (error) {
            toast.error("Failed to analyze application. Check API Key.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
        >
            {loading ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-3 w-3" />
            )}
            Analyze Match
        </Button>
    )
}
