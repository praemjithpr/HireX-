"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function UpdateStatusForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("applications").update({ status }).eq("id", applicationId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error:", error)
      alert("Failed to update status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="border-violet-200 focus:border-violet-500 focus:ring-violet-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="applied">Applied</SelectItem>
          <SelectItem value="screening">Screening</SelectItem>
          <SelectItem value="interview">Interview</SelectItem>
          <SelectItem value="offered">Offered</SelectItem>
          <SelectItem value="hired">Hired</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-700">
        {isLoading ? "Updating..." : "Update Status"}
      </Button>
    </form>
  )
}
