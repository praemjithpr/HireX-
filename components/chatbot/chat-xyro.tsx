"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { MessageSquare, X, Send, Bot, User, Loader2, Minus, Maximize2, Sparkles, TrendingUp, FileText, Users as UsersIcon, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Message {
    role: "user" | "assistant"
    content: string
}

const QUICK_ACTIONS = [
    { icon: TrendingUp, label: "Show Analytics", prompt: "Show me my recruitment analytics and key metrics" },
    { icon: UsersIcon, label: "Application Status", prompt: "What's the status of my applications?" },
    { icon: Calendar, label: "Upcoming Interviews", prompt: "Show me my upcoming interviews" },
    { icon: FileText, label: "Job Insights", prompt: "Give me insights on my job postings" },
]

export default function ChatXyro() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "👋 Hi! I'm **Xyro**, your smart recruitment assistant.\n\nI can help you with:\n• 📊 Analytics & insights\n• 👥 Application tracking\n• 📅 Interview scheduling\n• 💡 Recruitment advice\n• ✍️ Job description improvements\n\nWhat would you like to know?"
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [showQuickActions, setShowQuickActions] = useState(true)
    const pathname = usePathname()
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        async function fetchUser() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single()
                setUserRole(profile?.role || null)
            }
        }
        fetchUser()
    }, [])

    if (pathname?.includes("/login") || pathname?.includes("/signup")) {
        return null
    }

    const handleSend = async (customPrompt?: string) => {
        const userMessage = customPrompt || input.trim()
        if (!userMessage || isLoading) return

        setInput("")
        setShowQuickActions(false)
        setMessages(prev => [...prev, { role: "user", content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    userId: userId,
                    userRole: userRole,
                    context: "You are Xyro, an advanced AI recruitment assistant powered by Gemini 2.5 Flash. You help recruiters and candidates with intelligent insights, data analysis, and recruitment guidance. Format your responses with markdown for better readability. Use emojis sparingly for emphasis. Be professional yet friendly."
                })
            })

            const data = await response.json()
            if (response.ok && data.response) {
                setMessages(prev => [...prev, { role: "assistant", content: data.response }])
            } else {
                const errorMsg = data.details || data.error || "Sorry, I encountered an error. Please try again."
                setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "❌ Failed to connect. Please check your connection and try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    const formatMessage = (content: string) => {
        // Simple markdown-like formatting
        return content
            .split('\n')
            .map((line, i) => {
                // Bold
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Italic
                line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
                // Bullet points
                if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                    return `<div class="ml-2 my-1">${line}</div>`
                }
                return line
            })
            .join('<br/>')
    }

    const chatSize = isMaximized
        ? "w-[95vw] h-[90vh] max-w-6xl"
        : "w-[480px] h-[650px]"

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen ? (
                <Card className={cn(
                    "shadow-2xl border-none rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300 transition-all",
                    chatSize
                )}>
                    <CardHeader className="bg-gradient-to-r from-[#7C5CDB] to-[#9B7EE8] text-white p-5 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-sm overflow-hidden">
                                <Image
                                    src="/xyro-logo.jpg"
                                    alt="Xyro"
                                    width={36}
                                    height={36}
                                    className="rounded-lg object-cover"
                                />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    Xyro Assistant
                                    <Badge className="bg-white/20 text-white text-[9px] px-2 py-0.5 font-semibold">
                                        v2.5
                                    </Badge>
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">
                                        {userRole === "recruiter" ? "Recruiter Assistant" : "Career Assistant"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white hover:bg-white/10 rounded-lg transition-all"
                                onClick={() => setIsMaximized(!isMaximized)}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white hover:bg-white/10 rounded-lg transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-grow overflow-hidden p-0 bg-gradient-to-b from-slate-50 to-white">
                        <ScrollArea className="h-full p-5" ref={scrollRef}>
                            <div className="space-y-4 pb-4">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden",
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-[#7C5CDB] to-[#9B7EE8] text-white"
                                                : "bg-white text-[#7C5CDB] border-2 border-[#7C5CDB]/20"
                                        )}>
                                            {msg.role === "user" ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Image
                                                    src="/xyro-logo.jpg"
                                                    alt="Xyro"
                                                    width={32}
                                                    height={32}
                                                    className="rounded-lg object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-[#7C5CDB] to-[#9B7EE8] text-white rounded-tr-none"
                                                : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                                        )}>
                                            <div
                                                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                                className="prose prose-sm max-w-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 mr-auto items-center animate-in fade-in duration-300">
                                        <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm border-2 border-[#7C5CDB]/20 overflow-hidden">
                                            <Image
                                                src="/xyro-logo.jpg"
                                                alt="Xyro"
                                                width={32}
                                                height={32}
                                                className="rounded-lg animate-pulse object-cover"
                                            />
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 text-[#7C5CDB] animate-spin" />
                                            <span className="text-sm text-slate-600 font-medium">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                {showQuickActions && messages.length === 1 && (
                                    <div className="mt-6 space-y-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Quick Actions</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {QUICK_ACTIONS.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSend(action.prompt)}
                                                    className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 hover:border-[#7C5CDB] hover:bg-[#7C5CDB]/5 transition-all group"
                                                >
                                                    <action.icon className="h-4 w-4 text-slate-400 group-hover:text-[#7C5CDB] transition-colors" />
                                                    <span className="text-xs font-medium text-slate-700 group-hover:text-[#7C5CDB] transition-colors">
                                                        {action.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 bg-white border-t border-slate-100">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full gap-2 items-center"
                        >
                            <Input
                                placeholder="Ask Xyro anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-grow h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#7C5CDB] text-sm font-medium"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-12 w-12 bg-gradient-to-br from-[#7C5CDB] to-[#9B7EE8] hover:from-[#6B4BC4] hover:to-[#8A6DD7] rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#7C5CDB] to-[#9B7EE8] hover:from-[#6B4BC4] hover:to-[#8A6DD7] shadow-2xl shadow-[#7C5CDB]/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden p-2"
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                            src="/xyro-logo.jpg"
                            alt="Xyro"
                            width={52}
                            height={52}
                            className="rounded-2xl object-cover"
                        />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse z-10" />
                    </div>
                    <div className="absolute -top-12 right-0 bg-white text-[#7C5CDB] text-[10px] font-bold py-2 px-4 rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest">
                        Chat with Xyro
                    </div>
                </Button>
            )}
        </div>
    )
}
