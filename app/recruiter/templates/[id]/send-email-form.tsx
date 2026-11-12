"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail } from "lucide-react"
import { useState } from "react"

export default function SendEmailForm({
  template,
}: {
  template: {
    id: string
    name: string
    template_type: string
    subject: string
    body: string
  }
}) {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [customizedSubject, setCustomizedSubject] = useState(template.subject)
  const [customizedBody, setCustomizedBody] = useState(template.body)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          subject: customizedSubject,
          body: customizedBody,
        }),
      })

      if (!response.ok) throw new Error("Failed to send email")

      setMessage({ type: "success", text: "Email sent successfully!" })
      setRecipientEmail("")
    } catch (error) {
      console.error("[v0] Error:", error)
      setMessage({ type: "error", text: "Failed to send email. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-violet-200 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-violet-900">Send Email</CardTitle>
        <CardDescription className="text-violet-600">Customize and send this template</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-violet-900">
              Recipient Email
            </Label>
            <Input
              id="recipient"
              type="email"
              placeholder="candidate@example.com"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-violet-900">
              Subject
            </Label>
            <Input
              id="subject"
              type="text"
              required
              value={customizedSubject}
              onChange={(e) => setCustomizedSubject(e.target.value)}
              className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-violet-900">
              Message
            </Label>
            <Textarea
              id="body"
              rows={8}
              required
              value={customizedBody}
              onChange={(e) => setCustomizedBody(e.target.value)}
              className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
            <p className="text-xs text-violet-600">
              Use placeholders like {"{"}
              {"{"}candidate_name{"}"}, {"{"}
              {"{"}job_title{"}"}
              {"}"}
            </p>
          </div>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-700">
            {isLoading ? (
              "Sending..."
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
