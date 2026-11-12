import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText, Mail } from "lucide-react"

export default async function TemplatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all email templates
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("template_type", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center px-6 py-4">
          <Link href="/recruiter/dashboard">
            <Button variant="ghost" size="icon" className="mr-4 text-violet-700 hover:bg-violet-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-violet-600" />
            <span className="text-2xl font-bold text-violet-900">Email Templates</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-violet-900">Email Templates</h1>
          <p className="text-violet-700">Pre-defined templates for common recruitment communications</p>
        </div>

        {templates && templates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="border-violet-200 bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-violet-900">{template.name}</CardTitle>
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
                  <p className="mb-4 line-clamp-3 text-sm text-violet-700">{template.body}</p>
                  <Link href={`/recruiter/templates/${template.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Template
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardContent className="py-16 text-center">
              <Mail className="mx-auto mb-4 h-16 w-16 text-violet-300" />
              <h2 className="mb-2 text-2xl font-bold text-violet-900">No templates found</h2>
              <p className="text-violet-700">
                Email templates will be automatically seeded when you run the SQL scripts
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
