"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function InterviewQuestionsButton({ applicationId }: { applicationId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGenerateQuestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      })

      if (!response.ok) throw new Error("Failed to generate questions")

      router.refresh()
    } catch (error) {
      console.error("[v0] Error:", error)
      alert("Failed to generate interview questions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerateQuestions} disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-700">
      {isLoading ? (
        "Generating..."
      ) : (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          Generate Questions
        </>
      )}
    </Button>
  )
}
