import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const { jobId, jobTitle } = await request.json()

        if (!jobId || !jobTitle) {
            return NextResponse.json({ error: "Missing job details" }, { status: 400 })
        }

        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        return NextResponse.json({ success: true, message: "Job broadcast simulated successfully" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to broadcast job" }, { status: 500 })
    }
}
