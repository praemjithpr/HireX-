import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
    Briefcase, FileText, LayoutDashboard, LogOut, Menu, Settings, User, Users,
    Calendar, BarChart, Building, Shield, Database
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NotificationsPopover } from "./notifications-popover"
import { UserNav } from "./user-nav"
import { NavMenu } from "./nav-menu"

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return (
        <div className="flex min-h-screen bg-[#f8fbff]">
            {/* Persistent Sidebar */}
            <aside className="hidden lg:flex w-72 bg-[#232e3c] text-white flex-col border-r border-[#2d3a4b] shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="p-6 flex items-center gap-2 border-b border-[#2d3a4b]">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Hirex</span>
                </div>

                <div className="flex-1 py-6 px-4 space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Core</p>
                        <NavMenu variant="sidebar" />
                    </div>
                </div>

                <div className="p-4 border-t border-[#2d3a4b]">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2d3a4b] transition-colors cursor-pointer group">
                        <div className="h-9 w-9 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
                            <User className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate">{profile?.full_name || "Recruiter"}</span>
                            <span className="text-[10px] text-gray-400 truncate uppercase tracking-wider font-bold">Admin Panel</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-50 px-4 lg:px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-[#232e3c] border-none text-white p-0 w-72">
                                <aside className="flex flex-col h-full overflow-y-auto">
                                    <div className="p-6 flex items-center gap-2 border-b border-[#2d3a4b]">
                                        <Briefcase className="h-6 w-6 text-blue-500" />
                                        <span className="text-xl font-bold">Hirex</span>
                                    </div>
                                    <div className="flex-1 py-6 px-4">
                                        <NavMenu variant="sidebar" />
                                    </div>
                                </aside>
                            </SheetContent>
                        </Sheet>

                        <div className="relative max-w-md w-full hidden md:block group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Menu className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search candidates, jobs..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pl-4 shrink-0">
                        <NotificationsPopover />
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        <UserNav user={user} profile={profile} />
                    </div>
                </header>

                <main className="flex-1 relative">
                    {children}
                </main>
            </div>
        </div>
    )
}
