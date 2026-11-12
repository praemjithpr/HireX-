"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function closeJob(jobId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("jobs")
        .update({ status: "closed" })
        .eq("id", jobId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/recruiter/dashboard")
    revalidatePath("/recruiter/jobs")
    revalidatePath("/candidate/jobs") // Ensure it disappears for candidates
}
