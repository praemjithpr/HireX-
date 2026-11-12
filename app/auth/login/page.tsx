"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile to determine role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      // Redirect based on role
      if (profile?.role === "recruiter") {
        router.push("/recruiter/dashboard")
      } else {
        router.push("/candidate/dashboard")
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
            <CardTitle className="text-2xl font-bold text-violet-900">Welcome Back</CardTitle>
            <CardDescription className="text-violet-600">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-violet-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="recruiter@hirex.ai"
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
                {successMessage && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{successMessage}</div>
                )}
                {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-violet-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-violet-700 underline underline-offset-4 hover:text-violet-900"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
