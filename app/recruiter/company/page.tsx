import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Globe, Upload } from "lucide-react"

export default function CompanyProfilePage() {
    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
                    <p className="text-muted-foreground">Manage your employer brand and company details.</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>This information will be displayed on your job postings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Company Name</Label>
                                <Input defaultValue="Hirex Inc." />
                            </div>
                            <div className="grid gap-2">
                                <Label>Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input className="pl-10" defaultValue="https://hirex.ai" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>About Us</Label>
                                <Textarea className="h-32" placeholder="Tell candidates about your company..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Branding</CardTitle>
                            <CardDescription>Logo and brand colors.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted/80">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-medium">Company Logo</h4>
                                    <p className="text-sm text-muted-foreground">Recommended size: 512x512px (PNG, JPG)</p>
                                    <Button variant="outline" size="sm">Upload New</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Changes</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
