"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
    const [integrations, setIntegrations] = useState({
        linkedin: false,
        indeed: false,
        naukri: false,
    })

    // Simulated connection handler
    const handleConnect = (platform: keyof typeof integrations) => {
        // In a real app, this would initiate OAuth or API key validation
        setIntegrations(prev => ({ ...prev, [platform]: !prev[platform] }))
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto flex items-center px-6 py-4">
                    <Link href="/recruiter/dashboard">
                        <Button variant="ghost" size="icon" className="mr-4 hover:bg-accent hover:text-accent-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <span className="text-2xl font-bold text-primary">Account Settings</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-4xl px-6 py-8 space-y-8">

                {/* Job Board Integrations */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Job Board Integrations</h2>
                        <p className="text-muted-foreground">
                            Connect your accounts to automatically cross-post jobs and sync applications.
                        </p>
                    </div>

                    {/* LinkedIn */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <span className="text-[#0077b5] font-bold">LinkedIn</span>
                                    {integrations.linkedin && <CheckCircle className="h-5 w-5 text-green-500" />}
                                </CardTitle>
                                <CardDescription>
                                    Post jobs to your LinkedIn page and source candidates.
                                </CardDescription>
                            </div>
                            <Switch
                                checked={integrations.linkedin}
                                onCheckedChange={() => handleConnect('linkedin')}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {integrations.linkedin ? (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-700 dark:text-green-400">
                                    Connected to LinkedIn Recruiter
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="linkedin-api">API Key / Client ID</Label>
                                        <Input id="linkedin-api" placeholder="Enter your LinkedIn API Key" className="max-w-md" />
                                    </div>
                                    <Button variant="outline" className="w-fit" onClick={() => handleConnect('linkedin')}>
                                        Connect Account
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Indeed */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <span className="text-[#2164f3] font-bold">Indeed</span>
                                    {integrations.indeed && <CheckCircle className="h-5 w-5 text-green-500" />}
                                </CardTitle>
                                <CardDescription>
                                    Sponsor jobs and manage candidates directly from Indeed.
                                </CardDescription>
                            </div>
                            <Switch
                                checked={integrations.indeed}
                                onCheckedChange={() => handleConnect('indeed')}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {integrations.indeed ? (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-700 dark:text-green-400">
                                    Connected to Indeed Employer
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="indeed-email">Employer Email</Label>
                                        <Input id="indeed-email" placeholder="recruiter@company.com" className="max-w-md" />
                                    </div>
                                    <Button variant="outline" className="w-fit" onClick={() => handleConnect('indeed')}>
                                        Connect Account
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Naukri */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <span className="text-[#2D2D2D] dark:text-white font-bold">Naukri</span>
                                    {integrations.naukri && <CheckCircle className="h-5 w-5 text-green-500" />}
                                </CardTitle>
                                <CardDescription>
                                    Access India's largest job network.
                                </CardDescription>
                            </div>
                            <Switch
                                checked={integrations.naukri}
                                onCheckedChange={() => handleConnect('naukri')}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {integrations.naukri ? (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-700 dark:text-green-400">
                                    Connected to Naukri Recruiter
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="naukri-user">Username</Label>
                                        <Input id="naukri-user" placeholder="Naukri Recruiter Username" className="max-w-md" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="naukri-key">API Key</Label>
                                        <Input id="naukri-key" type="password" placeholder="••••••••" className="max-w-md" />
                                    </div>
                                    <Button variant="outline" className="w-fit" onClick={() => handleConnect('naukri')}>
                                        Connect Account
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    )
}
