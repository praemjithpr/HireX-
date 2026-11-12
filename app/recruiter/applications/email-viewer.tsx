"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Download, Mail } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EmailViewerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    email: any
}

export function EmailViewer({ open, onOpenChange, email }: EmailViewerProps) {
    if (!email) return null

    // Priority: file_url > attachment_path > file_path > file_name
    let publicUrl = email.file_url || null

    if (!publicUrl) {
        const filePath = email.attachment_path || email.file_path || email.file_name
        if (filePath) {
            // Construct full URL if it's just a path/name
            publicUrl = filePath.startsWith('http')
                ? filePath
                : `https://tpbqoojiiotnswsefrbc.supabase.co/storage/v1/object/public/resumes/${filePath}`
        }
    }

    const fileName = email.file_name || "Resume Attachment"

    const handleDownload = () => {
        if (publicUrl) {
            window.open(publicUrl, '_blank')
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[800px] sm:w-[900px] flex flex-col md:max-w-[75vw]">
                <div className="flex flex-col flex-1 h-full overflow-hidden">
                    {/* Top Group: Header + Attachment Bar */}
                    <div className="space-y-2 mb-3">
                        <SheetHeader>
                            <SheetTitle className="text-xl font-bold leading-tight">{email.email_subject || "Resume Application"}</SheetTitle>
                            <SheetDescription className="text-xs">
                                Received from <span className="font-semibold text-primary">{email.sender_email}</span> on {new Date(email.received_at).toLocaleDateString()}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border/50">
                            <div className="h-8 w-8 bg-rose-50 flex items-center justify-center rounded-lg border border-rose-100">
                                <span className="text-[10px] font-black text-rose-600">PDF</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate leading-none mb-1">{fileName}</p>
                                <p className="text-[10px] text-muted-foreground leading-none">{publicUrl ? "Attachment Ready" : "No file linked"}</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-xs px-3" asChild disabled={!publicUrl}>
                                {publicUrl ? (
                                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-3.5 w-3.5" /> Open / Download
                                    </a>
                                ) : (
                                    <span>No File</span>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 gap-2 h-full overflow-hidden">
                        {/* Preview Section */}
                        <div className="flex-1 border rounded-xl bg-muted/20 overflow-hidden relative">
                            {publicUrl ? (
                                <iframe
                                    src={`${publicUrl}#toolbar=0`}
                                    className="w-full h-full"
                                    title="Resume Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                                    No preview available
                                </div>
                            )}
                        </div>

                        {/* Extracted Text Section - Increased Size */}
                        <div className="h-[250px] border rounded-xl overflow-hidden bg-background shadow-inner flex flex-col shrink-0">
                            <div className="bg-slate-100 px-4 py-2.5 border-b text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 shrink-0">
                                <Mail className="h-3.5 w-3.5" /> Extracted Email & Resume Content
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600 font-medium">
                                    {email.resume_text_content || email.resume_text || email.email_body || "No extracted text content available."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
