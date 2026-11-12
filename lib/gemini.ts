import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDE6XVZwdAGQ91PSCTyMF3-2EsVd6qv4QU")

export async function generateATSScore(
  jobDescription: string,
  resume: string,
): Promise<{
  score: number
  analysis: string
  strengths: string[]
  weaknesses: string[]
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description and provide a detailed assessment.

Job Description:
${jobDescription}

Resume/Application:
${resume}

Please provide:
1. An ATS score from 0-100 based on how well the resume matches the job requirements
2. A brief analysis explaining the score
3. Key strengths (3-5 points)
4. Areas for improvement (3-5 points)

Respond in JSON format:
{
  "score": number,
  "analysis": "string",
  "strengths": ["string"],
  "weaknesses": ["string"]
}`

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  // Parse JSON response
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response")
  }

  return JSON.parse(jsonMatch[0])
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  candidateResume: string,
): Promise<{
  questions: Array<{
    question: string
    category: string
    difficulty: string
  }>
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const prompt = `You are an expert interviewer. Generate 10 personalized interview questions for the following role and candidate.

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Candidate Resume/Background:
${candidateResume}

Generate 10 interview questions that are:
1. Tailored to the specific role and candidate's background
2. Mix of technical and behavioral questions
3. Varied difficulty levels (easy, medium, hard)
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

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  // Parse JSON response
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response")
  }

  return JSON.parse(jsonMatch[0])
}

export async function chatWithGemini(message: string, context?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const prompt = context
    ? `Context: ${context}\n\nUser Question: ${message}\n\nProvide a helpful and concise response.`
    : message

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; reasoning: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    const prompt = `Analyze the sentiment of this text and return JSON: {"sentiment": "positive"|"neutral"|"negative", "score": number, "reasoning": "string"}\n\nText: ${text}`
    const result = await model.generateContent(prompt)
    const match = result.response.text().match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : { sentiment: "neutral", score: 50, reasoning: "Analyzed" }
  } catch (e) {
    return { sentiment: "neutral", score: 50, reasoning: "Neutral evaluation" }
  }
}

export async function compareCandidates(jobDescription: string, candidates: Array<{ id: string; name: string; resume: string }>): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    const prompt = `Compare these candidates for role: ${jobDescription}. Candidates: ${JSON.stringify(candidates)}. Return JSON: {"comparison": [{"id": "string", "name": "string", "fitScore": number, "summary": "string"}]}`
    const result = await model.generateContent(prompt)
    const match = result.response.text().match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : { comparison: [] }
  } catch (e) {
    return { comparison: [] }
  }
}

export async function generateJobDescription(title: string, skills: string[], experience: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    const prompt = `Write a comprehensive, professional Job Description for title: ${title}, required skills: ${skills.join(", ")}, experience level: ${experience}.`
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (e) {
    return `Job Description for ${title} requiring skills in ${skills.join(", ")}.`
  }
}

export async function summarizeResume(resumeText: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    const prompt = `Summarize this resume into JSON with summary, keySkills, and experienceSummary: ${resumeText}`
    const result = await model.generateContent(prompt)
    const match = result.response.text().match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : { summary: "Candidate profile", keySkills: [], experienceSummary: "" }
  } catch (e) {
    return { summary: "Candidate profile", keySkills: [], experienceSummary: "" }
  }
}

export async function analyzeEmailApplication(emailContent: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
    const prompt = `Analyze this email application and return JSON: {"candidateName": "string", "role": "string", "summary": "string"}\n\nContent: ${emailContent}`
    const result = await model.generateContent(prompt)
    const match = result.response.text().match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : { candidateName: "Applicant", role: "Software Engineer", summary: "Application received" }
  } catch (e) {
    return { candidateName: "Applicant", role: "Software Engineer", summary: "Application received" }
  }
}

