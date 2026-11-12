"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const COLORS = {
    primary: "#2563eb",   // Blue
    secondary: "#64748b", // Slate
    accent: "#f59e0b",    // Amber
    success: "#16a34a",   // Green
    danger: "#dc2626",    // Red
    purple: "#7c3aed",    // Purple
    teal: "#0d9488",      // Teal
}

const FUNNEL_COLORS = [
    "#3b82f6", // Applied - Blue
    "#eab308", // Screening - Yellow
    "#f97316", // Interview - Orange
    "#a855f7", // Offered - Purple
    "#22c55e", // Hired - Green
]

interface FunnelChartProps {
    data: { stage: string; count: number }[]
}

export function FunnelChart({ data }: FunnelChartProps) {
    if (data.every(d => d.count === 0)) {
        return (
            <Card className="col-span-1 shadow-sm h-full">
                <CardHeader>
                    <CardTitle>Recruitment Funnel</CardTitle>
                    <CardDescription>Active candidates by stage</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-t border-dashed">
                    No active applications
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 shadow-sm h-full">
            <CardHeader>
                <CardTitle>Recruitment Funnel</CardTitle>
                <CardDescription>Active candidates by stage</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="stage"
                                type="category"
                                width={80}
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Bar dataKey="count" name="Candidates" radius={[0, 4, 4, 0]} barSize={32}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

interface TopJobsProps {
    data: { name: string; value: number }[]
}

export function TopJobsChart({ data }: TopJobsProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-1 shadow-sm h-full">
                <CardHeader>
                    <CardTitle>Top Performing Jobs</CardTitle>
                    <CardDescription>Highest applicant volume</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-t border-dashed">
                    No job data available
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 shadow-sm h-full">
            <CardHeader>
                <CardTitle>Top Performing Jobs</CardTitle>
                <CardDescription>Highest applicant volume</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Bar dataKey="value" name="Applicants" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
