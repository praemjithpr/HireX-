"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Mail, Users } from "lucide-react"
import { TeamList } from "./team-list"

export default function TeamPage() {
    return (
        <div className="container mx-auto px-6 py-8">
            <div className="w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                        <p className="text-muted-foreground">Invite colleagues to help hiring.</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                </div>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite New Member</CardTitle>
                            <CardDescription>Send an invitation email to add a new recruiter.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 max-w-2xl">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input placeholder="colleague@company.com" className="pl-10" />
                                </div>
                                <Button>Send Invite</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <CardTitle>Team Members</CardTitle>
                            </div>
                            <CardDescription>Manage your team's access and roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamList />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
