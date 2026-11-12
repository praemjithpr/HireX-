import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
    const supabase = await createClient()

    // Sign out the user
    await supabase.auth.signOut()

    // Redirect to the signed out page
    redirect("/auth/signed-out")
}

export async function POST(request: Request) {
    return GET(request)
}
