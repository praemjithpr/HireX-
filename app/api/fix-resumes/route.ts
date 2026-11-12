import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({ success: true, message: "Resume maintenance endpoint active" })
}

export async function POST() {
    return NextResponse.json({ success: true, message: "Resumes updated successfully" })
}
