"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Save, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function EditableTemplate({ template }: { template: any }) {
    const [isEditing, setIsEditing] = useState(false)
    const [subject, setSubject] = useState(template.subject)
    const [body, setBody] = useState(template.body)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from("email_templates")
                .update({ subject, body, updated_at: new Date().toISOString() })
                .eq("id", template.id)

            if (error) throw error

            toast.success("Template updated successfully")
            setIsEditing(false)
            router.refresh()
        } catch (error: any) {
            console.error("Error updating template:", error)
            toast.error("Failed to update template: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Input
                        id="edit-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-body">Template Body</Label>
                    <Textarea
                        id="edit-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={12}
                        className="bg-background font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Use placeholders like {"{{candidate_name}}"}, {"{{job_title}}"}, {"{{assessment_date}}"}
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Template Content</h3>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Template
                </Button>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                <p className="text-sm text-foreground bg-background/50 p-2 rounded border">{template.subject}</p>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Message Body:</p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed bg-background/50 p-4 rounded border">
                    {template.body}
                </pre>
            </div>
        </div>
    )
}
