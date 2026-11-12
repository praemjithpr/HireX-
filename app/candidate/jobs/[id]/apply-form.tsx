"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [coverLetter, setCoverLetter] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      let resumeUrl = ""

      // Upload resume if provided
      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `resumes/${fileName}`

        const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, resumeFile)

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("resumes").getPublicUrl(filePath)

        resumeUrl = publicUrl
      }

      // Create application
      const { error: insertError } = await supabase.from("applications").insert({
        job_id: jobId,
        candidate_id: user.id,
        resume_url: resumeUrl,
        cover_letter: coverLetter,
        status: "applied",
      })

      if (insertError) throw insertError

      router.push("/candidate/applications")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-violet-200 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-violet-900">Apply for this Position</CardTitle>
        <CardDescription className="text-violet-600">Submit your application</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-violet-900">
              Resume (Optional)
            </Label>
            <div className="flex flex-col gap-2">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
              />
              <p className="text-xs text-violet-600">Upload your resume (PDF, DOC, DOCX)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-violet-900">
              Cover Letter (Optional)
            </Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're a great fit for this role..."
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
            {isLoading ? (
              "Submitting..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
