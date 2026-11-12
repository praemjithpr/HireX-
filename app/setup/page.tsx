"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Copy, UserPlus, Briefcase, Users } from "lucide-react"

export default function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const credentials = [
    {
      role: "Recruiter/Admin",
      email: "recruiter@hirex.ai",
      password: "Recruiter@2025",
      name: "John Recruiter",
      company: "HireX Inc.",
      icon: Briefcase,
      color: "violet",
    },
    {
      role: "Candidate",
      email: "candidate@hirex.ai",
      password: "Candidate@2025",
      name: "Jane Candidate",
      company: "",
      icon: Users,
      color: "blue",
    },
    {
      role: "Admin",
      email: "admin@hirex.ai",
      password: "admin@2025",
      name: "Admin User",
      company: "HireX Admin",
      icon: UserPlus,
      color: "indigo",
    },
  ]

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Credentials Setup</h1>
            <p className="text-lg text-gray-600">Create test accounts to explore the hirex.ai platform</p>
          </div>

          <Card className="p-8 mb-8 border-violet-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup Instructions</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold mt-1">
                  1
                </div>
                <div>
                  <p className="font-semibold">Create Accounts via Signup</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Use the credentials below to create accounts at{" "}
                    <a href="/auth/signup" className="text-violet-600 hover:underline">
                      /auth/signup
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold mt-1">
                  2
                </div>
                <div>
                  <p className="font-semibold">Select Appropriate Role</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose "Recruiter" for admin access or "Candidate" for user access
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold mt-1">
                  3
                </div>
                <div>
                  <p className="font-semibold">Login and Test Features</p>
                  <p className="text-sm text-gray-600 mt-1">
                    After signup, login at{" "}
                    <a href="/auth/login" className="text-violet-600 hover:underline">
                      /auth/login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all">All Credentials</TabsTrigger>
              <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
              <TabsTrigger value="candidate">Candidate</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {credentials.map((cred, index) => (
                <CredentialCard key={index} credential={cred} copied={copied} onCopy={copyToClipboard} />
              ))}
            </TabsContent>

            {credentials.map((cred) => (
              <TabsContent key={cred.role.toLowerCase()} value={cred.role.toLowerCase()}>
                <CredentialCard credential={cred} copied={copied} onCopy={copyToClipboard} />
              </TabsContent>
            ))}
          </Tabs>

          <Card className="p-6 mt-8 bg-violet-50 border-violet-200">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/auth/signup"
                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 transition-colors"
              >
                <UserPlus className="w-5 h-5 text-violet-600" />
                <span className="font-medium text-gray-900">Sign Up</span>
              </a>
              <a
                href="/auth/login"
                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-violet-600" />
                <span className="font-medium text-gray-900">Login</span>
              </a>
              <a
                href="/"
                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 transition-colors"
              >
                <Briefcase className="w-5 h-5 text-violet-600" />
                <span className="font-medium text-gray-900">Home</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CredentialCard({
  credential,
  copied,
  onCopy,
}: {
  credential: any
  copied: string | null
  onCopy: (text: string, field: string) => void
}) {
  const Icon = credential.icon

  return (
    <Card className="p-6 border-violet-200 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg bg-${credential.color}-100`}>
          <Icon className={`w-6 h-6 text-${credential.color}-600`} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{credential.role}</h3>
          <p className="text-sm text-gray-600">{credential.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
          <div className="flex gap-2">
            <Input value={credential.email} readOnly className="flex-1 font-mono text-sm" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(credential.email, `${credential.role}-email`)}
              className="shrink-0"
            >
              {copied === `${credential.role}-email` ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Password</Label>
          <div className="flex gap-2">
            <Input value={credential.password} readOnly type="text" className="flex-1 font-mono text-sm" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(credential.password, `${credential.role}-password`)}
              className="shrink-0"
            >
              {copied === `${credential.role}-password` ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {credential.company && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Company Name</Label>
            <Input value={credential.company} readOnly className="font-mono text-sm" />
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <a href="/auth/signup">
            <Button className="w-full bg-violet-600 hover:bg-violet-700">Create This Account</Button>
          </a>
        </div>
      </div>
    </Card>
  )
}
