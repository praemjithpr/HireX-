"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, User, Shield } from "lucide-react"

export function TeamList() {
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            // In a real app with organization support, we would filter by org_id.
            // Here we just fetch all recruiters for demo purposes or self.
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "recruiter") // Assuming role column exists based on previous code

            setMembers(data || [])
        } catch (error) {
            console.error("Error fetching team", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Loading team members...</div>

    return (
        <div className="space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Member</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>

            {members.map((member) => (
                <div key={member.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="col-span-5 flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {member.full_name?.substring(0, 2).toUpperCase() || "TM"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-base">{member.full_name || "Team Member"}</p>
                            <p className="text-sm text-muted-foreground">{member.email || "No email"}</p>
                        </div>
                    </div>

                    <div className="col-span-3">
                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                            {member.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            <span className="capitalize">{member.role || "Recruiter"}</span>
                        </Badge>
                    </div>

                    <div className="col-span-3">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm">Active</span>
                        </div>
                    </div>

                    <div className="col-span-1 text-right">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}

            {members.length === 0 && (
                <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
                    No other team members found.
                </div>
            )}
        </div>
    )
}
