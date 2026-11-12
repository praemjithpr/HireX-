"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Camera, CheckCircle2, ChevronRight, Loader2, Maximize, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// Sample Questions for Developer Role
const QUESTIONS = [
    {
        id: 1,
        question: "What is the primary purpose of React's useEffect hook?",
        options: [
            "To manage state in functional components",
            "To perform side effects in functional components",
            "To optimize rendering performance",
            "To handle user events"
        ],
        answer: 1
    },
    {
        id: 2,
        question: "Which of the following is NOT a valid Git command?",
        options: [
            "git push",
            "git pull",
            "git save",
            "git commit"
        ],
        answer: 2
    },
    {
        id: 3,
        question: "What does SQL stand for?",
        options: [
            "Structured Question Language",
            "Simple Query Language",
            "Standard Query Language",
            "Structured Query Language"
        ],
        answer: 3
    },
    {
        id: 4,
        question: "Which data structure follows the Last-In, First-Out (LIFO) principle?",
        options: [
            "Queue",
            "Stack",
            "Linked List",
            "Tree"
        ],
        answer: 1
    },
    {
        id: 5,
        question: "In JavaScript, what is the default behavior of 'var' variables regarding scope?",
        options: [
            "Block scope",
            "Global scope only",
            "Function scope or global",
            "Immediate scope only"
        ],
        answer: 2
    },
    {
        id: 6,
        question: "What is the complexity of searching an element in a balanced Binary Search Tree?",
        options: [
            "O(1)",
            "O(n)",
            "O(log n)",
            "O(n log n)"
        ],
        answer: 2
    },
    {
        id: 7,
        question: "Which HTTP status code represents 'Internal Server Error'?",
        options: [
            "400",
            "404",
            "500",
            "503"
        ],
        answer: 2
    },
    {
        id: 8,
        question: "In CSS, which property is used to change the text color of an element?",
        options: [
            "font-color",
            "text-color",
            "color",
            "foreground-color"
        ],
        answer: 2
    },
    {
        id: 9,
        question: "What is the purpose of Docker?",
        options: [
            "To compile code into binaries",
            "To manage database migrations",
            "To containerize applications and their dependencies",
            "To provide version control for source code"
        ],
        answer: 2
    },
    {
        id: 10,
        question: "Which of these is a popular NoSQL database?",
        options: [
            "PostgreSQL",
            "MySQL",
            "MongoDB",
            "SQLite"
        ],
        answer: 2
    }
]

function AssessmentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const applicationId = searchParams.get("id")
    const supabase = createClient()

    // State
    const [status, setStatus] = useState<"loading" | "setup" | "active" | "completed">("loading")
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [malpracticeCount, setMalpracticeCount] = useState(0)
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [application, setApplication] = useState<any>(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [sourceType, setSourceType] = useState<"portal" | "email">("portal")

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Load application or resume
    useEffect(() => {
        const loadApp = async () => {
            if (!applicationId) {
                toast.error("Invalid assessment ID")
                router.push("/candidate/dashboard")
                return
            }

            // 1. Try fetching from applications table (Portal)
            const { data: appData, error: appError } = await supabase
                .from("applications")
                .select("*, jobs(*)")
                .eq("id", applicationId)
                .single()

            if (appData && !appError) {
                if (appData.status !== "assessment") {
                    toast.error("You are not cleared for assessment at this stage.")
                    router.push("/candidate/dashboard")
                    return
                }

                if (appData.assessment_status === "completed") {
                    setStatus("completed")
                } else {
                    setApplication(appData)
                    setSourceType("portal")
                    setStatus("setup")
                }
                return
            }

            // 2. Fallback: Try fetching from resumes table (Email/Synced)
            const { data: resData, error: resError } = await supabase
                .from("resumes")
                .select("*")
                .eq("id", applicationId)
                .single()

            if (resData && !resError) {
                if (resData.status !== "assessment") {
                    toast.error("You are not cleared for assessment at this stage.")
                    // For email candidates, we just show error as dashboard might not exist for them
                    return
                }

                if (resData.assessment_status === "completed") {
                    setStatus("completed")
                } else {
                    // Map resume properties to look like application for UI
                    setApplication({
                        ...resData,
                        jobs: { title: resData.role || "Developer" }
                    })
                    setSourceType("email")
                    setStatus("setup")
                }
                return
            }

            // Both failed
            toast.error("Assessment not found or expired")
            console.error("Load Error:", { appError, resError })
            // router.push("/candidate/dashboard")
        }

        loadApp()
    }, [applicationId, router, supabase])

    // Timer to refresh "isTimeYet" state
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 10000) // Update every 10 seconds
        return () => clearInterval(interval)
    }, [])

    // Sync video stream to the video element whenever it mounts or status changes
    useEffect(() => {
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream
        }
    }, [videoStream, status])

    // Proctoring: Detect Visibility Change (Tab Switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && status === "active") {
                setMalpracticeCount(prev => prev + 1)
                toast.warning("Warning: Tab switching detected. This event has been recorded.", {
                    description: "Switching tabs during an assessment is not allowed."
                })
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [status])

    // Proctoring: Detect Fullscreen Exit
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement
            setIsFullScreen(isFull)

            if (!isFull && status === "active") {
                setMalpracticeCount(prev => prev + 1)
                toast.error("Error: Exit from full screen detected.", {
                    description: "Please stay in full screen mode to complete the assessment."
                })
            }
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [status])

    // Setup Video
    const startSetup = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            setVideoStream(stream)
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (err) {
            console.error("Webcam Error:", err)
            toast.error("Camera Access Required", {
                description: "Please enable camera access to proceed with the proctored assessment."
            })
        }
    }

    const startAssessment = () => {
        if (!videoStream) {
            toast.error("Please enable your camera first.")
            return
        }

        if (containerRef.current) {
            containerRef.current.requestFullscreen().then(() => {
                setStatus("active")
                setIsFullScreen(true)
            }).catch(err => {
                toast.error("Fullscreen Failed", { description: "Please enable fullscreen to start." })
            })
        }
    }

    const handleAnswer = (optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }))
    }

    const handleNext = () => {
        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            submitAssessment()
        }
    }

    const submitAssessment = async () => {
        setIsSaving(true)

        // Calculate Score
        let correctCount = 0
        QUESTIONS.forEach((q, index) => {
            if (answers[index] === q.answer) {
                correctCount++
            }
        })

        const score = (correctCount / QUESTIONS.length) * 100

        try {
            const table = sourceType === "portal" ? "applications" : "resumes"
            const { error } = await supabase
                .from(table)
                .update({
                    assessment_score: Math.round(score),
                    assessment_status: "completed"
                })
                .eq("id", applicationId)

            if (error) throw error

            // Cleanup
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop())
            }
            if (document.fullscreenElement) {
                document.exitFullscreen()
            }

            setStatus("completed")
            toast.success("Assessment Submitted Successfully")
        } catch (error: any) {
            console.error("Submission Error:", error)
            toast.error("Failed to submit results. Please contact support.")
        } finally {
            setIsSaving(false)
        }
    }

    // Unified Variables
    const currentQuestion = QUESTIONS[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100
    const scheduledTime = application?.assessment_date ? new Date(application.assessment_date) : null
    const now = currentTime
    const isTimeYet = !scheduledTime || now >= scheduledTime
    const timeLeft = scheduledTime ? Math.max(0, scheduledTime.getTime() - now.getTime()) : 0
    const minutesLeft = Math.ceil(timeLeft / 60000)

    return (
        <div ref={containerRef} className="min-h-screen bg-background">
            {/* 1. Loading State */}
            {status === "loading" && (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Loading assessment environment...</p>
                    </div>
                </div>
            )}

            {/* 2. Completed State */}
            {status === "completed" && (
                <div className="min-h-screen flex items-center justify-center p-6">
                    <Card className="max-w-md w-full text-center border-2 border-emerald-500 shadow-xl">
                        <CardHeader>
                            <div className="mx-auto bg-emerald-100 p-3 rounded-full w-fit mb-4">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-foreground">Successfully Attended!</CardTitle>
                            <CardDescription className="text-lg">Your assessment has been recorded.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground">
                                Thank you for completing the technical assessment for the <strong>{application?.jobs?.title || "Developer"}</strong> role.
                            </p>
                            <p className="text-sm border p-4 rounded-lg bg-muted/50">
                                The recruitment team will review your performance and proctoring logs. You will be notified of the next steps via email or dashboard.
                            </p>
                            <Button onClick={() => router.push("/candidate/dashboard")} className="w-full">
                                Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 3. Setup State */}
            {status === "setup" && (
                <div className="min-h-screen bg-muted/30 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-foreground">Assessment Setup</h1>
                            <p className="text-muted-foreground">Preparing proctored environment for {application?.jobs?.title || "Position"}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Instructions & Requirements</CardTitle>
                                    {scheduledTime && (
                                        <div className={`mt-2 p-3 rounded-lg flex items-center gap-3 border ${isTimeYet ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                            <AlertCircle className="h-5 w-5" />
                                            <div className="text-xs">
                                                <p className="font-bold">Scheduled Time</p>
                                                <p>{scheduledTime.toLocaleString()}</p>
                                                {!isTimeYet && <p className="mt-1 font-semibold animate-pulse">Starts in {minutesLeft} minutes</p>}
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ul className="space-y-4 text-sm">
                                        <li className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">1</div>
                                            <span><strong>Camera Access:</strong> Your webcam must remain ON throughout the assessment for proctoring.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">2</div>
                                            <span><strong>Full Screen:</strong> The assessment will open in full screen mode. Exiting will be flagged.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">3</div>
                                            <span><strong>Fair Play:</strong> Do not switch tabs, minimize the window, or use external resources.</span>
                                        </li>
                                    </ul>

                                    {!videoStream ? (
                                        <Button onClick={startSetup} className="w-full h-12">
                                            <Camera className="mr-2 h-5 w-5" /> Enable Camera
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={startAssessment}
                                            disabled={!isTimeYet}
                                            className={`w-full h-12 ${isTimeYet ? "bg-emerald-600 hover:bg-emerald-700" : "bg-muted cursor-not-allowed"}`}
                                        >
                                            <Maximize className="mr-2 h-5 w-5" /> {isTimeYet ? "Enter Full Screen & Start" : "Waiting for Scheduled Time..."}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-xl">Camera Preview</CardTitle>
                                    <CardDescription>Ensure you are clearly visible in a well-lit area.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 min-h-[300px] relative bg-black rounded-lg overflow-hidden">
                                    {videoStream ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 space-y-2">
                                            <Camera className="h-12 w-12" />
                                            <p>Camera not enabled</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Active Assessment State */}
            {status === "active" && (
                <div className="flex flex-col h-screen font-sans select-none relative overflow-hidden">
                    {/* Proctoring Header */}
                    <header className="border-b px-6 py-4 flex items-center justify-between bg-card shrink-0">
                        <div className="flex items-center gap-4">
                            <img src="/logo.png" alt="HireX" className="h-8" />
                            <div className="h-8 w-[1px] bg-border" />
                            <div>
                                <h2 className="font-bold text-foreground">Technical Assessment</h2>
                                <p className="text-xs text-muted-foreground">{application?.jobs?.title || "Position"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Badge variant={malpracticeCount > 0 ? "destructive" : "secondary"}>
                                    {malpracticeCount > 0 ? `Warnings: ${malpracticeCount}` : "Proctoring Active"}
                                </Badge>
                                {!isFullScreen && (
                                    <Badge variant="destructive" className="animate-pulse">
                                        <AlertTriangle className="h-3 w-3 mr-1" /> EXITED FULLSCREEN
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Floating Webcam Overlay */}
                    <div className="fixed bottom-24 right-6 z-50 group pointer-events-none">
                        <div className="h-32 w-48 bg-black rounded-lg overflow-hidden border-2 border-primary shadow-2xl relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] text-white font-bold tracking-widest bg-black/40 px-1 rounded">LIVE</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-center mt-1 font-bold text-muted-foreground opacity-50">Webcam Monitor</p>
                    </div>

                    <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 md:p-12 overflow-y-auto">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
                                    <span>{Math.round(progress)}% Complete</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <Card className="border-none shadow-none bg-transparent">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-2xl font-bold leading-tight">
                                        {currentQuestion.question}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswer(index)}
                                            className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group
                                                ${answers[currentQuestionIndex] === index
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-border hover:border-primary/50 hover:bg-accent"}`}
                                        >
                                            <span className="flex items-center gap-4">
                                                <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-sm
                                                    ${answers[currentQuestionIndex] === index
                                                        ? "bg-primary border-primary text-primary-foreground"
                                                        : "bg-muted border-border group-hover:border-primary/50"}`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="text-lg font-medium">{option}</span>
                                            </span>
                                            {answers[currentQuestionIndex] === index && <CheckCircle2 className="h-6 w-6 text-primary" />}
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </main>

                    <footer className="border-t p-6 bg-card shrink-0">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>All actions are being recorded. Do not exit current view.</span>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleNext}
                                disabled={answers[currentQuestionIndex] === undefined || isSaving}
                                className="px-12 h-14 text-lg font-bold"
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : currentQuestionIndex === QUESTIONS.length - 1 ? (
                                    "Submit Final Assessment"
                                ) : (
                                    <>Next Question <ChevronRight className="ml-2 h-5 w-5" /></>
                                )}
                            </Button>
                        </div>
                    </footer>
                </div>
            )}
        </div>
    )
}

export default function AssessmentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AssessmentContent />
        </Suspense>
    )
}
