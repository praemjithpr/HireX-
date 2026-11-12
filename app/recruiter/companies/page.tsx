"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, Briefcase, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchCompanies = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .order("name")

            if (data) setCompanies(data)
            setLoading(false)
        }

        fetchCompanies()
    }, [])

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
                    <p className="text-muted-foreground">Manage your client companies and their profiles.</p>
                </div>
                {/* Placeholder for Add Company functionality - could be a dialog or page */}
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Company
                </Button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search companies by name or industry..."
                    className="pl-10 max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : filteredCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map(company => (
                        <Link href={`/recruiter/companies/${company.id}`} key={company.id} className="block group">
                            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                        {company.logo_url ? (
                                            <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{company.name}</CardTitle>
                                        <Badge variant="secondary" className="font-normal">{company.industry || "General"}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{company.location || "Remote"}</span>
                                        </div>
                                        {company.website && (
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                                            </div>
                                        )}
                                        <p className="line-clamp-2 mt-2 pt-2 border-t">
                                            {company.about || "No description available."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No companies found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or add a new company.</p>
                </div>
            )}
        </div>
    )
}
