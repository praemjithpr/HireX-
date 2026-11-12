"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download } from "lucide-react"
import { useState } from "react"

export default function AppointmentLetterGenerator({ applicationId }: { applicationId: string }) {
  const [formData, setFormData] = useState({
    startDate: "",
    reportingManager: "",
    workingHours: "9 AM - 6 PM",
    recruiterName: "",
    recruiterTitle: "HR Manager",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [letterContent, setLetterContent] = useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/generate-appointment-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          templateData: formData,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate letter")

      const data = await response.json()
      setLetterContent(data.content)
    } catch (error) {
      console.error("[v0] Error:", error)
      alert("Failed to generate appointment letter")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!letterContent) return

    const blob = new Blob([letterContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `appointment-letter-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-violet-200 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-900">
          <FileText className="h-5 w-5" />
          Appointment Letter Generator
        </CardTitle>
        <CardDescription className="text-violet-600">Generate a professional appointment letter</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-violet-900">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportingManager" className="text-violet-900">
                Reporting Manager
              </Label>
              <Input
                id="reportingManager"
                type="text"
                required
                value={formData.reportingManager}
                onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours" className="text-violet-900">
                Working Hours
              </Label>
              <Input
                id="workingHours"
                type="text"
                required
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruiterName" className="text-violet-900">
                Your Name
              </Label>
              <Input
                id="recruiterName"
                type="text"
                required
                value={formData.recruiterName}
                onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="recruiterTitle" className="text-violet-900">
                Your Title
              </Label>
              <Input
                id="recruiterTitle"
                type="text"
                required
                value={formData.recruiterTitle}
                onChange={(e) => setFormData({ ...formData, recruiterTitle: e.target.value })}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-700">
            {isLoading ? "Generating..." : "Generate Letter"}
          </Button>

          {letterContent && (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto rounded-lg border border-violet-200 bg-violet-50 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-violet-900">{letterContent}</pre>
              </div>
              <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" />
                Download as Text
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
