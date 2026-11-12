"use client"

import { Button } from "@/components/ui/button"
import {
    Briefcase, FileText, LayoutDashboard, Settings, Users,
    Calendar, BarChart, Building, Shield, Database, LogOut
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
    { href: "/recruiter/applications", label: "Candidates", icon: Users },
    { href: "/recruiter/shared", label: "Shared Candidates", icon: Users },
    { href: "/recruiter/interviews", label: "Interviews", icon: Calendar },
    { href: "/recruiter/analytics", label: "Analytics", icon: BarChart },
    { href: "/recruiter/templates", label: "Email Templates", icon: FileText },
    { href: "/recruiter/companies", label: "Companies", icon: Building },
    { href: "/recruiter/talent-pool", label: "Talent Pool", icon: Database },
    { href: "/recruiter/team", label: "Team", icon: Shield },
    { href: "/recruiter/settings", label: "Settings", icon: Settings },
]

interface NavMenuProps {
    variant?: "default" | "sidebar"
}

export function NavMenu({ variant = "default" }: NavMenuProps) {
    const pathname = usePathname()
    const isSidebar = variant === "sidebar"

    return (
        <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/recruiter/dashboard" && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                    <Button
                        key={item.href}
                        variant="ghost"
                        asChild
                        className={cn(
                            "w-full justify-start h-10 text-sm font-medium transition-all duration-200",
                            isSidebar
                                ? isActive
                                    ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                : isActive
                                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                    : "text-foreground hover:bg-muted"
                        )}
                    >
                        <Link href={item.href} className="flex items-center">
                            <Icon className={cn(
                                "mr-3 h-4 w-4",
                                isSidebar
                                    ? isActive ? "text-blue-400" : "text-gray-500 group-hover:text-white"
                                    : isActive ? "text-blue-600" : "text-muted-foreground"
                            )} />
                            {item.label}
                        </Link>
                    </Button>
                )
            })}
        </nav>
    )
}
