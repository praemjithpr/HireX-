import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json()

    // 1. Authenticate the user
    // We use the Server Client which has the user's session from cookies
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Update the collaboration via RPC to bypass permissions
    const { error } = await supabase.rpc('accept_collaboration_invite', {
      invite_id: id,
      new_status: status
    })

    if (error) {
      console.error("Error updating collaboration:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Handler error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
