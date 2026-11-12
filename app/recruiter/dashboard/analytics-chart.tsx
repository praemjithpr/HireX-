"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface AnalyticsChartProps {
    total: number
    hired: number
    rejected: number
    inProcess: number
}

const COLORS = {
    Total: "#94a3b8", // Slate 400
    Hired: "#16a34a", // Green 600
    Rejected: "#dc2626", // Red 600
    "In Process": "#2563eb", // Blue 600
}

export default function AnalyticsChart({ total, hired, rejected, inProcess }: AnalyticsChartProps) {
    const data = [
        { name: "Hired", value: hired },
        { name: "Rejected", value: rejected },
        { name: "In Process", value: inProcess },
        { name: "Pending Review", value: Math.max(0, total - (hired + rejected + inProcess)) }
    ].filter(item => item.value > 0);

    const activeColors = [
        COLORS.Hired,
        COLORS.Rejected,
        COLORS["In Process"],
        "#f59e0b" // Amber for Pending
    ];

    if (total === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-border p-8 text-muted-foreground">
                No data available for analytics
            </div>
        )
    }

    return (
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
                            <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
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
    )
}
