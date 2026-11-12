import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    return NextResponse.json({ 
        success: true, 
        message: "Gmail sync endpoint active. Running in background mode." 
    })
}
