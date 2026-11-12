import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Clock, User } from "lucide-react"
import Link from "next/link"

export default async function SharedApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    // Fetch accepted collaborations where current user is recipient
    // AND fetch the associated application data
    const { data: shares } = await supabase
        .from("collaborations")
        .select(`
            id,
            created_at,
            sender:sender_id(full_name, email),
            application:candidate_id(
                id,
                status,
                applied_at,
                application_data,
                jobs(title)
            )
        `)
        .eq("recipient_email", user.email)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Shared Candidates</h1>
                <p className="text-muted-foreground">Candidates shared with you for review.</p>
            </div>

            <div className="grid gap-6">
                {shares && shares.length > 0 ? (
                    shares.map((share: any) => (
                        <Card key={share.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            {share.application?.application_data?.personal_information?.full_name || share.application?.application_data?.name || "Candidate"}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <User className="h-3 w-3" />
                                            Shared by <span className="font-medium text-foreground">{share.sender?.full_name || share.sender?.email}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <Clock className="h-3 w-3" />
                                            {new Date(share.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Link href={`/recruiter/applications/${share.application?.id}`}>
                                        <Button size="sm">
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Applied for</p>
                                        <p className="text-sm text-muted-foreground">{share.application?.jobs?.title || "Unknown Position"}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-sm font-medium">Status</p>
                                        <Badge variant="outline" className="capitalize">
                                            {share.application?.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                        <User className="h-10 w-10 opacity-50 mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No shared candidates</h3>
                        <p>When a recruiter shares a candidate with you, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
