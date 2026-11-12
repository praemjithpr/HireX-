import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import SendEmailForm from "./send-email-form"

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get template details
  const { data: template } = await supabase.from("email_templates").select("*").eq("id", id).single()

  if (!template) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center px-6 py-4">
          <Link href="/recruiter/templates">
            <Button variant="ghost" size="icon" className="mr-4 text-violet-700 hover:bg-violet-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-2xl font-bold text-violet-900">Email Template</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Template Details */}
          <div className="lg:col-span-2">
            <Card className="border-violet-200 bg-white shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-violet-900">{template.name}</CardTitle>
                    <CardDescription className="text-violet-600">{template.subject}</CardDescription>
                  </div>
                  <Badge
                    className={
                      template.template_type === "offer"
                        ? "bg-green-100 text-green-700"
                        : template.template_type === "rejection"
                          ? "bg-red-100 text-red-700"
                          : template.template_type === "interview_call"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                    }
                  >
                    {template.template_type.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-violet-50 p-6">
                  <h3 className="mb-4 font-semibold text-violet-900">Template Body</h3>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-violet-700 leading-relaxed">
                    {template.body}
                  </pre>
                </div>

                {template.template_type === "appointment_letter" && (
                  <div className="mt-6">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">
                      <Download className="mr-2 h-4 w-4" />
                      Generate & Download PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Send Email Form */}
          <div className="lg:col-span-1">
            <SendEmailForm template={template} />
          </div>
        </div>
      </main>
    </div>
  )
}
