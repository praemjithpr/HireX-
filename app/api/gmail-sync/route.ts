import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import imaps from 'imap-simple'
import { simpleParser } from 'mailparser'
import { analyzeEmailApplication } from '@/lib/gemini'

// Polyfill for pdf-parse
// @ts-ignore
if (typeof DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix { constructor() { } }
}

export async function POST() {
    let pdf: any = null;
    try {
        pdf = require('pdf-parse');
    } catch (e) {
        console.error("Failed to load pdf-parse:", e);
    }

    const supabase = await createClient()

    const config = {
        imap: {
            user: process.env.GMAIL_USER,
            password: process.env.GMAIL_APP_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 3000
        }
    }

    if (!config.imap.user || !config.imap.password) {
        return NextResponse.json({ error: 'Gmail credentials not configured in .env' }, { status: 500 })
    }

    try {
        const connection = await imaps.connect(config)
        await connection.openBox('INBOX')

        const searchCriteria = [
            'UNSEEN',
            ['HEADER', 'SUBJECT', 'resume']
        ]

        // Fetch last 10 matching emails to avoid timeout
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: true
        }

        const messages = await connection.search(searchCriteria, fetchOptions)
        console.log(`[Gmail Sync] Found ${messages.length} messages matching criteria.`)

        let count = 0

        for (const item of messages) {
            const all = item.parts.find((part: any) => part.which === '')
            const id = item.attributes.uid
            const idHeader = "Imap-Id: " + id + "\r\n"

            const parsed = await simpleParser(idHeader + all.body)

            const subject = parsed.subject || "No Subject"
            const from = parsed.from?.value[0]?.address
            const date = parsed.date
            let text = parsed.text
            const attachments = parsed.attachments

            console.log(`[Gmail Sync] Processing: ${subject} from ${from}`)

            // 1. Extract Role from Subject
            // Expected format: "Resume - Software Engineer" or "Application for Marketing Manager"
            let role = "General Application"
            const subjectCleaner = subject.trim()

            // AGGRESSIVE CLEANING
            // 1. Remove "Resume" (case insensitive) and any following separator (-, :, or space)
            let cleaned = subjectCleaner.replace(/^resume\s*[-–:]?\s*/i, "")

            // 2. Remove "Application for" or "Applying for"
            cleaned = cleaned.replace(/^(application|applying)\s*(for)?\s*/i, "")

            // 3. Remove "Job Application" prefix if present
            cleaned = cleaned.replace(/^job\s*application\s*[-–:]?\s*/i, "")

            cleaned = cleaned.trim()

            // If we have something left that isn't empty, that's our role
            if (cleaned.length > 0) {
                role = cleaned
            }

            console.log(`[Gmail Sync] Cleaned Role: "${role}" (Original: "${subject}")`)

            // Save to Supabase
            // 3. Upload Attachment if PDF
            let attachmentPath = null
            const resumeFile = attachments.find(a => a.contentType === 'application/pdf')

            // NEW: Parse PDF Text if available
            // This is critical because many emails have empty bodies and just an attachment.
            if (resumeFile) {
                try {
                    // pdf-parse expects a buffer. mailparser gives us a buffer in `content`.
                    // Handle import difference
                    const pdfParser = (pdf && typeof pdf === 'function') ? pdf : (pdf?.default)

                    if (pdfParser) {
                        const pdfData = await pdfParser(resumeFile.content)
                        if (pdfData && pdfData.text) {
                            console.log(`[Gmail Sync] Extracted ${pdfData.text.length} chars from PDF attachment.`)
                            text = (text || "") + "\n\n--- RESUME CONTENT ---\n" + pdfData.text
                        }
                    } else {
                        console.error('[Gmail Sync] PDF Parser not loaded correctly.')
                    }
                } catch (pdfErr) {
                    console.error('[Gmail Sync] PDF Parse Error:', pdfErr)
                }
            }

            // 2. Analyze Resume with ML Model (New)
            let skillFit = 60
            let experience = "Fresher"
            let matchedSkills: string[] = []

            if (text && text.length > 50) {
                try {
                    console.log(`[Gmail Sync] Calling ML Model for role: ${role}`)
                    const mlResponse = await fetch("http://localhost:5000/predict", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            resume_text: text.substring(0, 5000),
                            role: role
                        })
                    })

                    if (mlResponse.ok) {
                        const mlData = await mlResponse.json()
                        skillFit = mlData.score || mlData.ml_score || skillFit
                        experience = mlData.experience || experience
                        role = mlData.category || mlData.role || role
                        matchedSkills = mlData.skills || []
                        console.log(`[Gmail Sync] ML success. Fit: ${skillFit}%, Exp: ${experience}`)
                    } else {
                        throw new Error("ML Server not responding")
                    }
                } catch (err) {
                    console.warn(`[Gmail Sync] ML Model failed, falling back to Gemini:`, err)
                    try {
                        const analysis = await analyzeEmailApplication(role, text.substring(0, 5000))
                        skillFit = analysis.skill_fit
                        experience = analysis.experience
                        role = analysis.inferred_role || role
                        matchedSkills = analysis.matched_skills || []
                    } catch (geminiErr) {
                        console.error("[Gmail Sync] AI Fallback also failed")
                    }
                }
            }

            if (resumeFile) {
                const fileName = `${Date.now()}-${resumeFile.filename}`
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('resumes')
                    .upload(fileName, resumeFile.content)

                if (!uploadError) {
                    attachmentPath = uploadData.path
                } else {
                    console.error('[Gmail Sync] Storage Error:', uploadError)
                }
            }

            // 4. Insert into DB
            const { data: { user } } = await supabase.auth.getUser()

            const { error: dbError } = await supabase
                .from('resumes')
                .insert({
                    email_subject: subject,
                    sender_email: from,
                    email_body: text,
                    attachment_path: attachmentPath,
                    received_at: date,
                    status: 'new',
                    resume_text: text?.substring(0, 5000),
                    owner_id: user?.id,
                    role: role,
                    skill_fit: skillFit,
                    experience: experience,
                    matched_skills: matchedSkills
                })

            if (!dbError) {
                count++
            } else {
                console.error('[Gmail Sync] DB Insert Error:', dbError)
            }
        }

        connection.end()

        return NextResponse.json({ success: true, count, message: `Synced ${count} new applications` })

    } catch (error: any) {
        console.error('IMAP Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
