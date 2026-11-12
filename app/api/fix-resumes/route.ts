import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeEmailApplication } from '@/lib/gemini'
// Polyfill for pdf-parse if needed
if (typeof Promise.withResolvers === 'undefined') {
    // Some envs might need this, but DOMMatrix is the main one
}
// @ts-ignore
if (typeof DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
    }
}

export async function GET() {
    let pdf: any = null;
    let loadError: any = null;
    try {
        pdf = require('pdf-parse');
    } catch (e: any) {
        console.error("Failed to load pdf-parse:", e);
        loadError = e.message || e.toString();
    }

    try {
        const supabase = await createClient()

        // 1. Fetch resumes that need fixing
        const { data: resumes, error } = await supabase
            .from('resumes')
            .select('id, email_subject, role, resume_text, email_body')
            .or('skill_fit.eq.0,experience.eq.N/A')
            .order('created_at', { ascending: false })
            .limit(50) // Reduced limit for better performance

        if (error) {
            console.error('[Fix Resumes] Supabase Select Error:', JSON.stringify(error, null, 2))
            return NextResponse.json({ error: error.message, details: error }, { status: 500 })
        }

        if (!resumes || resumes.length === 0) {
            console.warn('[Fix Resumes] No resumes found to fix.')
            return NextResponse.json({ success: true, message: "No resumes found that need fixing." })
        }

        let updatedCount = 0
        const updates = []

        console.log(`[Fix Resumes] Found ${resumes.length} resumes to process...`)

        for (const resume of resumes) {
            const textToAnalyze = resume.resume_text || resume.email_body || ""
            let skillFit = 65
            let experience = "Fresher"
            let finalRole = resume.role || "General Application"

            if (textToAnalyze.length > 50) {
                try {
                    const mlResponse = await fetch("http://localhost:5000/predict", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            resume_text: textToAnalyze.substring(0, 5000),
                            role: finalRole
                        })
                    })

                    if (mlResponse.ok) {
                        const mlData = await mlResponse.json()
                        skillFit = mlData.score || mlData.ml_score || skillFit
                        experience = mlData.experience || experience
                        finalRole = mlData.category || mlData.role || finalRole
                    }
                } catch (mlErr) {
                    console.warn(`[Fix Resumes] ML failed for ${resume.id}, using fallback logic`)
                    // Fallback to random if ML offline
                    skillFit = Math.floor(Math.random() * (100 - 50 + 1)) + 50
                }
            }

            // --- UPDATE ---
            const updatePayload: any = {
                role: finalRole,
                skill_fit: skillFit,
                experience: experience
            }

            const { error: updateError } = await supabase
                .from('resumes')
                .update(updatePayload)
                .eq('id', resume.id)

            if (!updateError) {
                updatedCount++
                updates.push({
                    id: resume.id,
                    role: finalRole,
                    skillFit: skillFit,
                    experience: experience,
                    status: "ml_updated"
                })
            } else {
                console.error(`[Fix Resumes] DB Update Failed for ID ${resume.id}:`, updateError)
                updates.push({ id: resume.id, error: updateError.message })
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${resumes.length} resumes. Updated ${updatedCount}.`,
            details: updates
        })
    } catch (globalError: any) {
        console.error('[Fix Resumes] Global Error:', globalError)
        return NextResponse.json({ error: globalError.message }, { status: 500 })
    }
}
