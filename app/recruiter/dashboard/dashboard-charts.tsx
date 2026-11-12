"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
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

// Color palette for charts
const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.success, COLORS.purple];

interface ApplicationsTrendProps {
    data: { date: string; portal: number; email: number }[]
}

export function ApplicationsTrendChart({ data }: ApplicationsTrendProps) {
    return (
        <Card className="col-span-2 border-none bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50 py-4 px-6">
                <CardTitle className="text-base font-bold text-gray-800">Application Trend</CardTitle>
                <CardDescription className="text-xs font-medium text-gray-500">Daily application volume (Last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPortal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Area
                                type="monotone"
                                dataKey="portal"
                                name="Portal Applications"
                                stroke={COLORS.primary}
                                fillOpacity={1}
                                fill="url(#colorPortal)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="email"
                                name="Email Resumes"
                                stroke={COLORS.accent}
                                fillOpacity={1}
                                fill="url(#colorEmail)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

interface SourceBreakdownProps {
    data: { name: string; value: number }[]
}

export function SourceBreakdownChart({ data }: SourceBreakdownProps) {
    if (data.every(d => d.value === 0)) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Application Source</CardTitle>
                    <CardDescription>Where are candidates coming from?</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-t border-dashed">
                    No data available
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden h-full">
            <CardHeader className="border-b bg-gray-50/50 py-4 px-6">
                <CardTitle className="text-base font-bold text-gray-800">Application Source</CardTitle>
                <CardDescription className="text-xs font-medium text-gray-500">Distribution by channel</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center justify-center flex-grow">
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                itemStyle={{ color: "#1e293b", fontWeight: "700", fontSize: "12px" }}
                            />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: "20px", fontSize: "12px", fontWeight: "600" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

interface DepartmentStatsProps {
    data: { name: string; value: number }[]
}

export function DepartmentStatsChart({ data }: DepartmentStatsProps) {
    return (
        <Card className="col-span-2 lg:col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle>Open Jobs by Department</CardTitle>
                <CardDescription>Active hiring needs</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Bar dataKey="value" name="Open Positions" fill={COLORS.teal} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
