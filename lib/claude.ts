import Anthropic from "@anthropic-ai/sdk"

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || ""

const anthropic = new Anthropic({
    apiKey: CLAUDE_API_KEY,
})

export async function chatWithClaude(message: string, context?: string): Promise<string> {
    try {
        const systemPrompt = context || "You are Xyro, a helpful and professional AI recruitment assistant for the HireX platform. You help recruiters manage jobs and help candidates with their applications. Be concise and friendly."

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        })

        const textContent = response.content.find(block => block.type === 'text')
        return textContent && 'text' in textContent ? textContent.text : "I couldn't generate a response."
    } catch (error: any) {
        console.error("Claude API Error:", error)
        throw new Error(`Claude service unavailable: ${error.message}`)
    }
}

export async function generateATSScoreWithClaude(
    jobDescription: string,
    resume: string,
): Promise<{
    score: number
    skill_match: number
    experience_match: number
    analysis: string
    strengths: string[]
    weaknesses: string[]
}> {
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description and provide a detailed assessment.

Job Description:
${jobDescription}

Resume/Application:
${resume}

Please provide:
1. An overall ATS score from 0-100.
2. A separate "Skill Fit" score (0-100) based purely on technical/hard skills match.
3. A separate "Experience Fit" score (0-100) based on years of experience and relevance of past roles.
4. A brief analysis.
5. Key strengths and areas for improvement.

Respond in JSON format:
{
  "score": number,
  "skill_match": number,
  "experience_match": number,
  "analysis": "string",
  "strengths": ["string"],
  "weaknesses": ["string"]
}`

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        })

        const textContent = response.content.find(block => block.type === 'text')
        const text = textContent && 'text' in textContent ? textContent.text : ""

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error("Failed to parse AI response")
        }

        return JSON.parse(jsonMatch[0])
    } catch (error: any) {
        console.error("Claude ATS Error:", error)
        throw error
    }
}

export async function generateInterviewQuestionsWithClaude(
    jobTitle: string,
    jobDescription: string,
    candidateResume: string,
    difficulty: string = "mixed"
): Promise<{
    questions: Array<{
        question: string
        category: string
        difficulty: string
    }>
}> {
    const prompt = `You are an expert interviewer. Generate 10 personalized interview questions for the following role and candidate.

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Candidate Resume/Background:
${candidateResume}

Requested Difficulty Level: ${difficulty}

Generate 10 interview questions that are:
1. Tailored to the specific role and candidate's background
2. Mix of technical and behavioral questions
3. ALL questions should be targeting the '${difficulty}' difficulty level (unless 'mixed' is requested).
4. Cover different aspects (technical skills, problem-solving, teamwork, leadership)

Respond in JSON format:
{
  "questions": [
    {
      "question": "string",
      "category": "technical|behavioral|situational",
      "difficulty": "easy|medium|hard"
    }
  ]
}`

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        })

        const textContent = response.content.find(block => block.type === 'text')
        const text = textContent && 'text' in textContent ? textContent.text : ""

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error("Failed to parse AI response")
        }

        return JSON.parse(jsonMatch[0])
    } catch (error: any) {
        console.error("Claude Interview Questions Error:", error)
        throw error
    }
}

export async function generateJobDescriptionWithClaude(
    title: string,
    skills: string[],
    experience: string
): Promise<string> {
    const prompt = `Write a professional and detailed job description for a ${title} position.
    
Requirements:
- Experience Level: ${experience}
- Key Skills: ${skills.join(", ")}

The JD should include:
1. About the Role
2. Key Responsibilities (bullet points)
3. Required Qualifications (bullet points)
4. Why Join Us (brief)

Format nicely in Markdown.`

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        })

        const textContent = response.content.find(block => block.type === 'text')
        return textContent && 'text' in textContent ? textContent.text : "Failed to generate job description"
    } catch (error: any) {
        console.error("Claude JD Error:", error)
        throw error
    }
}

export async function summarizeResumeWithClaude(resumeText: string): Promise<{
    summary: string,
    topSkills: string[],
    redFlags: string[],
    sentiment: "positive" | "neutral" | "caution"
}> {
    const prompt = `Analyze this resume and provide a quick executive summary for a recruiter.
    
Resume:
${resumeText}

Return JSON:
{
    "summary": "2-3 sentence overview highlighting key experience and roles",
    "topSkills": ["skill1", "skill2", "skill3"],
    "redFlags": ["potential concern 1", "potential concern 2"] (empty if none),
    "sentiment": "positive" | "neutral" | "caution"
}`

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        })

        const textContent = response.content.find(block => block.type === 'text')
        const text = textContent && 'text' in textContent ? textContent.text : ""

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        return jsonMatch ? JSON.parse(jsonMatch[0]) : {
            summary: "Failed to parse",
            topSkills: [],
            redFlags: [],
            sentiment: "neutral"
        }
    } catch (error: any) {
        console.error("Claude Resume Summary Error:", error)
        return {
            summary: "Error analyzing resume",
            topSkills: [],
            redFlags: [],
            sentiment: "neutral"
        }
    }
}
