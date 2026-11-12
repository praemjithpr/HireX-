"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                toast.error("Failed to send reset link", {
                    description: error.message,
                })
                return
            }

            setIsSubmitted(true)
            toast.success("Reset link sent!", {
                description: "Please check your email for the password reset link.",
            })
        } catch (error) {
            console.error("Reset password error:", error)
            toast.error("An error occurred", {
                description: "Please try again later.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center p-8 bg-slate-50 text-foreground overflow-y-auto">
            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-12 space-y-8 relative">

                {/* Back Button */}
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4 group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to login
                </Link>

                {/* Branding */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                        <div className="w-4 h-4 bg-white transform rotate-45" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">HireX</h1>
                </div>

                {!isSubmitted ? (
                    <>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Forgot password?</h2>
                            <p className="text-slate-500 text-lg">No worries, we'll send you reset instructions.</p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email address</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="h-12 pl-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Sending Link...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8 space-y-6">
                        <div className="inline-flex items-center justify-center h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full border-4 border-emerald-100 shadow-inner">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-slate-900">Check your email</h2>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                We've sent a password reset link to <br />
                                <span className="font-bold text-slate-900">{email}</span>
                            </p>
                        </div>
                        <div className="pt-4">
                            <Button
                                variant="outline"
                                className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Didn't receive the email? Try again
                            </Button>
                        </div>
                    </div>
                )}

                <div className="text-center text-sm font-medium text-slate-500 pt-4">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 hover:underline font-bold">
                        Sign in
                    </Link>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-indigo-50/50 to-transparent blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-1/2 bg-gradient-to-tr from-indigo-50/50 to-transparent blur-3xl opacity-50" />
        </div>
    )
}
