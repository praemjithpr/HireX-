"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function NotificationsPopover() {
    const [open, setOpen] = useState(false)
    const [invites, setInvites] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const fetchInvites = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("collaborations")
                .select(`
                    *,
                    sender:profiles!sender_id(full_name, email),
                    candidate_id,
                    applications!candidate_id(
                        id,
                        jobs(title)
                    )
                `)
                .eq("recipient_email", user.email)
                .eq("status", "pending")
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching invites:", error.message, error.details, error.hint)
                return
            }
            setInvites(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvites()

        const channel = supabase
            .channel('collab-invites')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'collaborations'
            }, () => {
                fetchInvites()
                toast("New collaboration invite received!")
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleAction = async (id: string, status: 'accepted' | 'rejected') => {
        try {
            // Use API endpoint to bypass RLS/Permission issues with 'users' table FKs
            const response = await fetch('/api/collaborations/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, status })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to update invite")
            }

            toast.success(`Invite ${status}`)
            setInvites(prev => prev.filter(i => i.id !== id))
        } catch (err: any) {
            toast.error(err.message || "Failed to update invite")
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10">
                    <Bell className="h-6 w-6" />
                    {invites.length > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold">Notifications</h4>
                    {invites.length > 0 && <Badge variant="secondary">{invites.length} Pending</Badge>}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : invites.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {invites.map((invite) => (
                                <div key={invite.id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                                            <UserPlus className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                Review Request
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                <strong>{invite.sender?.full_name || "A recruiter"}</strong> invited you to review a candidate for <strong>{invite.applications?.jobs?.title || "a job"}</strong>.
                                            </p>
                                            <div className="flex items-center gap-2 pt-2">
                                                <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-xs px-2" onClick={() => handleAction(invite.id, 'accepted')}>
                                                    <Check className="mr-1 h-3 w-3" /> Accept
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(invite.id, 'rejected')}>
                                                    <X className="mr-1 h-3 w-3" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
