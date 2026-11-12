"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface InviteModalProps {
    candidateId: string
    candidateName: string
}

export function InviteModal({ candidateId, candidateName }: InviteModalProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleInvite = async () => {
        if (!email) {
            toast.error("Please enter an email address")
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // 1. Create Collaboration Record
            const { data: collab, error: collabError } = await supabase
                .from("collaborations")
                .insert({
                    sender_id: user.id,
                    recipient_email: email,
                    candidate_id: candidateId,
                    status: 'pending'
                })
                .select()
                .single()

            if (collabError) throw collabError

            // 2. Notification handling
            // We rely on the NotificationsPopover fetching 'pending' collaborations directly.
            // So we don't need to manually insert into a notifications table or look up IDs here.

            toast.success(`Invite sent to ${email}`)
            setOpen(false)
            setEmail("")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to send invite")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite to Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Reviewer</DialogTitle>
                    <DialogDescription>
                        Share <strong>{candidateName}</strong> with a colleague for review.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="colleague@hirex.ai"
                            className="col-span-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleInvite} disabled={loading}>
                        {loading ? "Sending..." : "Send Invite"}
                        <Send className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
