import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, ArrowRight, FileText } from "lucide-react"

export default function ApplicationSubmittedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="max-w-md w-full border-border bg-card shadow-lg text-center">
                <CardHeader className="pb-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">Hurray!</CardTitle>
                    <CardDescription className="text-xl text-muted-foreground mt-2">
                        Your application has been successfully submitted.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <p className="text-muted-foreground">
                        We've received your details and our team will review your application shortly. Good luck!
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link href="/candidate/applications">
                            <Button className="w-full" size="lg">
                                <FileText className="mr-2 h-4 w-4" />
                                View My Applications
                            </Button>
                        </Link>
                        <Link href="/candidate/jobs">
                            <Button variant="outline" className="w-full" size="lg">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Browse More Jobs
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
