"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    job_type: "full-time",
    experience_level: "mid",
    skills_required: "",
    salary_range: "",
    openings: "1",
  })
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

      const { error: insertError } = await supabase.from("jobs").insert({
        title: formData.title,
        description: formData.description,
        department: formData.department,
        location: formData.location,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        skills_required: formData.skills_required.split(",").map((s) => s.trim()),
        salary_range: formData.salary_range,
        openings: Number.parseInt(formData.openings),
        status: "open",
        created_by: user.id,
      })

      if (insertError) throw insertError

      router.push("/recruiter/jobs")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center px-6 py-4">
          <Link href="/recruiter/jobs">
            <Button variant="ghost" size="icon" className="mr-4 text-violet-700 hover:bg-violet-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-2xl font-bold text-violet-900">Post New Job</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-3xl px-6 py-8">
        <Card className="border-violet-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-violet-900">Job Details</CardTitle>
            <CardDescription className="text-violet-600">
              Fill in the information for your new job posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-violet-900">
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Senior Software Engineer"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-violet-900">
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="Engineering"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-violet-900">
                  Job Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-violet-900">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_type" className="text-violet-900">
                    Job Type
                  </Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger className="border-violet-200 focus:border-violet-500 focus:ring-violet-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience_level" className="text-violet-900">
                    Experience Level
                  </Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                  >
                    <SelectTrigger className="border-violet-200 focus:border-violet-500 focus:ring-violet-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openings" className="text-violet-900">
                    Number of Openings
                  </Label>
                  <Input
                    id="openings"
                    type="number"
                    min="1"
                    required
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills_required" className="text-violet-900">
                  Required Skills (comma-separated)
                </Label>
                <Input
                  id="skills_required"
                  placeholder="React, TypeScript, Node.js"
                  required
                  value={formData.skills_required}
                  onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range" className="text-violet-900">
                  Salary Range
                </Label>
                <Input
                  id="salary_range"
                  placeholder="$100,000 - $150,000"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                  {isLoading ? "Posting..." : "Post Job"}
                </Button>
                <Link href="/recruiter/jobs" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-violet-300 text-violet-700 bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
