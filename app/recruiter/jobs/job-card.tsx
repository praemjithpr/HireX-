"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MoreHorizontal, MapPin, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function JobCard({ job }: { job: any }) {
    const router = useRouter()
    const supabase = createClient()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [status, setStatus] = useState(job.status)
    const [shortlistCount, setShortlistCount] = useState(5)
    const [isLoading, setIsLoading] = useState(false)

    const handleStatusUpdate = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/jobs/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId: job.id,
                    status: status,
                    shortlistCount: status === 'in_process' ? shortlistCount : undefined
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Update failed")

            toast.success("Job status updated successfully")
            setIsDialogOpen(false)
            router.refresh()
        } catch (error) {
            toast.error((error as Error).message || "Failed to update status")
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case "in_process": return "On Process"
            case "scheduled": return "Scheduled"
            case "closed": return "Closed"
            default: return "Open"
        }
    }

    return (
        <>
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow relative">
                <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg text-foreground">{job.title}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {job.company_name ? <span className="font-medium text-foreground/80">{job.company_name} • </span> : null}
                                {job.department}
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    job.status === "open" ? "bg-green-100 text-green-700 hover:bg-green-100/80" :
                                        job.status === "closed" ? "bg-gray-100 text-gray-700 hover:bg-gray-100/80" :
                                            job.status === "in_process" ? "bg-blue-100 text-blue-700 hover:bg-blue-100/80" :
                                                "bg-purple-100 text-purple-700 hover:bg-purple-100/80"
                                }
                            >
                                {getStatusLabel(job.status)}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                                        Manage Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/recruiter/jobs/${job.id}`}>View Details</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{job.total_application_count ?? job.applications?.[0]?.count ?? 0} candidates</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Link href={`/recruiter/jobs/${job.id}`} className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full bg-transparent"
                                >
                                    View Details
                                </Button>
                            </Link>
                            <Link href={`/recruiter/applications?search=${encodeURIComponent(job.title)}`} className="flex-1">
                                <Button className="w-full">Applications</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Job Status</DialogTitle>
                        <DialogDescription>
                            Changing status to <b>On Process</b> will auto-screen candidates (reject &lt;65%).
                            <br />
                            Closing the job will reject all pending candidates.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Current</Label>
                            <div className="col-span-3">
                                <Badge variant="outline">{getStatusLabel(job.status)}</Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">New Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_process">On Process</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {status === "in_process" && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="count" className="text-right">Shortlist Top</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={shortlistCount}
                                        onChange={(e) => setShortlistCount(Number(e.target.value))}
                                        min={1}
                                    />
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">candidates</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleStatusUpdate} disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Status"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
