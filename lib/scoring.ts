export function calculateSimpleScore(resumeText: string, jobSkills: string[]): { score: number, matched: string[] } {
    if (!resumeText || !jobSkills || jobSkills.length === 0) {
        return { score: 0, matched: [] }
    }

    const text = resumeText.toLowerCase()
    const matched: string[] = []

    jobSkills.forEach(skill => {
        if (text.includes(skill.toLowerCase())) {
            matched.push(skill)
        }
    })

    const score = Math.round((matched.length / jobSkills.length) * 100)

    return {
        score: Math.min(score, 100), // Cap at 100 just in case
        matched
    }
}
