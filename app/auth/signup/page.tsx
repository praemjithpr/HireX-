"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"recruiter" | "candidate">("candidate")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          emailRedirectTo: undefined, // No email confirmation needed
        },
      })

      if (error) throw error

      if (data.user) {
        // If email confirmation is disabled in Supabase, user is auto-confirmed
        // Otherwise, we'll sign them in immediately after signup
        if (data.session) {
          // User is already signed in
          if (role === "recruiter") {
            router.push("/recruiter/dashboard")
          } else {
            router.push("/candidate/dashboard")
          }
        } else {
          // Auto sign-in after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            // If auto sign-in fails, show success message and redirect to login
            router.push("/auth/login?message=Account created! Please sign in.")
          } else {
            // Successfully signed in
            if (role === "recruiter") {
              router.push("/recruiter/dashboard")
            } else {
              router.push("/candidate/dashboard")
            }
          }
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-violet-900">hirex.ai</h1>
          <p className="mt-2 text-violet-600">AI-Powered Recruitment Platform</p>
        </div>
        <Card className="border-violet-200 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-violet-900">Create Account</CardTitle>
            <CardDescription className="text-violet-600">Join hirex.ai and start your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-violet-900">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-violet-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-violet-900">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-violet-900">
                    I am a
                  </Label>
                  <Select value={role} onValueChange={(value) => setRole(value as "recruiter" | "candidate")}>
                    <SelectTrigger className="border-violet-200 focus:border-violet-500 focus:ring-violet-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">Candidate</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-violet-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-violet-700 underline underline-offset-4 hover:text-violet-900"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
