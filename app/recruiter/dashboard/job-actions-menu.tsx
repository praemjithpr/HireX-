"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, XCircle, Ban } from "lucide-react"
import Link from "next/link"
import { closeJob } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JobActionsMenuProps {
    jobId: string
    jobStatus: string
}

export default function JobActionsMenu({ jobId, jobStatus }: JobActionsMenuProps) {
    const router = useRouter()

    const handleCloseJob = async () => {
        try {
            await closeJob(jobId)
            toast.success("Job closed successfully")
            router.refresh()
        } catch (error) {
            toast.error("Failed to close job")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/recruiter/applications?jobId=${jobId}`} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Applications
                    </Link>
                </DropdownMenuItem>

                {jobStatus === "open" && (
                    <DropdownMenuItem onClick={handleCloseJob} className="text-red-600 focus:text-red-600 cursor-pointer">
                        <Ban className="mr-2 h-4 w-4" />
                        Close Job
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
