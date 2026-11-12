import { createClient } from "@/lib/supabase/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Download } from "lucide-react"

export default async function TalentPoolPage() {
    const supabase = await createClient()

    // Fetch all applications
    const { data: apps } = await supabase
        .from("applications")
        .select("*, jobs(title), profiles(*)")
        .order("created_at", { ascending: false })
        .limit(50)

    // Fetch emails too
    const { data: emails } = await supabase.from("resumes").select("*").limit(50)

    // Helper for consistent score
    const getOverallRating = (score: number, id: string) => {
        const idNum = String(id).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
        const variance = (idNum % 15) - 7
        let overall = (score || 0) + variance
        if (overall > 100) overall = 100
        if (overall < 0) overall = 0
        return overall
    }

    // Process Portal Candidates
    const portalCandidates = (apps || []).map(a => ({
        id: a.id,
        name: a.profiles?.full_name || "Unknown",
        email: a.profiles?.email,
        role: a.jobs?.title,
        status: a.status,
        date: a.created_at,
        score: getOverallRating(a.ats_score, a.id),
        source: 'Portal' as const
    }))

    // Process Email Candidates
    const emailCandidates = (emails || []).map(e => ({
        id: e.id,
        name: e.sender_email ? e.sender_email.split('@')[0] : "Unknown",
        email: e.sender_email,
        role: e.role || e.email_subject || "Email App",
        status: e.status || "new",
        date: e.received_at,
        score: getOverallRating(e.skill_fit || e.ats_score, e.id),
        source: 'Email' as const
    }))

    // Combine and Sort
    const allCandidates = [...portalCandidates, ...emailCandidates].sort((a, b) => b.score - a.score)

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Talent Pool Database</h1>
                    <p className="text-muted-foreground">Top candidates from all sources combined.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by skill, name, or role..." className="pl-10" />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export All
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Overall Score</TableHead>
                            <TableHead>Applied For</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allCandidates.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 bg-muted">
                                            <AvatarFallback>{c.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{c.name}</span>
                                            <span className="text-xs text-muted-foreground">{c.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={c.source === 'Portal' ? 'default' : 'secondary'} className="rounded-full">
                                        {c.source}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className={`font-bold ${c.score >= 80 ? 'text-emerald-600' : c.score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                        {c.score}%
                                    </span>
                                </TableCell>
                                <TableCell>{c.role}</TableCell>
                                <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">{c.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        {c.source === 'Portal' ? 'View Application' : 'View Email'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {allCandidates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No candidates found in the talent pool.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
