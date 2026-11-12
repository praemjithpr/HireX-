import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, LogIn } from "lucide-react"

export default function SignedOutPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="mb-6 rounded-full bg-green-100 p-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Signed Out Successfully</h1>
            <p className="mb-8 text-muted-foreground">
                You have been securely signed out of your account.
                <br />
                Thank you for using Hirex.
            </p>

            <div className="flex flex-col gap-4 min-w-[200px]">
                <Link href="/auth/login">
                    <Button className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In Again
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" className="w-full">
                        Return to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
