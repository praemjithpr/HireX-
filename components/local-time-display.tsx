"use client"

import { useEffect, useState } from "react"

interface LocalTimeDisplayProps {
    date: string | Date
    format?: "date" | "time" | "datetime" | "short"
    className?: string
}

export default function LocalTimeDisplay({ date, format = "datetime", className }: LocalTimeDisplayProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!date) return null

    if (!mounted) {
        return <span className={className}>...</span>
    }

    const d = new Date(date)
    let formatted = ""

    const options: Intl.DateTimeFormatOptions = {}

    if (format === "date") {
        options.month = "short"
        options.day = "numeric"
        options.year = "numeric"
    } else if (format === "time") {
        options.hour = "2-digit"
        options.minute = "2-digit"
    } else if (format === "short") {
        options.month = "short"
        options.day = "numeric"
        options.hour = "2-digit"
        options.minute = "2-digit"
    } else {
        // datetime
        options.month = "short"
        options.day = "numeric"
        options.year = "numeric"
        options.hour = "2-digit"
        options.minute = "2-digit"
    }

    formatted = d.toLocaleString(undefined, options)

    return (
        <span className={className} suppressHydrationWarning>
            {formatted}
        </span>
    )
}
