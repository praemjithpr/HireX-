"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ATSScoreButton({ applicationId }: { applicationId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGenerateScore = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      })

      if (!response.ok) throw new Error("Failed to generate score")

      router.refresh()
    } catch (error) {
      console.error("[v0] Error:", error)
      alert("Failed to generate ATS score")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerateScore} disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-700">
      {isLoading ? (
        "Analyzing..."
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate ATS Score
        </>
      )}
    </Button>
  )
}
