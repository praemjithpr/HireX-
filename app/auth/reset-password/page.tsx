"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Loader2, Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                toast.error("Failed to update password", {
                    description: error.message,
                })
                return
            }

            toast.success("Password reset successfully", {
                description: "You can now sign in with your new password.",
            })

            router.push("/auth/login")
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
            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-12 space-y-8">

                {/* Branding */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                        <div className="w-4 h-4 bg-white transform rotate-45" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">HireX</h1>
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Create new password</h2>
                    <p className="text-slate-500 text-lg">Set a strong password to protect your account.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-bold text-slate-700 uppercase tracking-wider">New Password</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 8 characters"
                                    className="h-12 pl-11 pr-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Confirm Password</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <Input
                                    id="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Repeat new password"
                                    className="h-12 pl-11 pr-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all font-medium"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
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
                                Updating Password...
                            </>
                        ) : (
                            <span className="flex items-center gap-2">
                                Reset Password <ArrowRight className="h-5 w-5" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>

            <p className="mt-8 text-sm text-slate-500 font-medium tracking-wide flex items-center gap-2">
                Secured by <span className="text-indigo-600 font-black">HireX Auth System</span>
            </p>
        </div>
    )
}
