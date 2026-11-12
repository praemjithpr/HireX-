"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import { toast } from "sonner"

interface OfferGeneratorProps {
    candidateName: string
    jobTitle: string
}

export default function OfferGenerator({ candidateName, jobTitle }: OfferGeneratorProps) {
    const [open, setOpen] = useState(false)
    const [salary, setSalary] = useState("120,000")
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const generateOffer = async () => {
        setLoading(true)
        try {
            const doc = new jsPDF()

            // Header
            doc.setFontSize(22)
            doc.setTextColor(40, 40, 40)
            doc.text("HireX", 20, 20)

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text("Global Capability Center", 20, 26)
            doc.text("123 Tech Park, Innovation City", 20, 31)

            // Date
            const today = new Date().toLocaleDateString()
            doc.text(today, 160, 31)

            // Candidate Details
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.text(`Dear ${candidateName},`, 20, 50)

            // Body
            const bodyText = `We are pleased to offer you the position of ${jobTitle} at HireX. 
We were impressed with your skills and experience, and we believe you will be a fantastic addition to our team.

Terms of Employment:
- Position: ${jobTitle}
- Annual Salary: $${salary}
- Start Date: ${startDate}
- Location: Hybrid (Remote/Office)

This offer is contingent upon the successful completion of background checks. 
We look forward to welcoming you to the team!

Sincerely,`

            doc.setFontSize(12)
            const splitText = doc.splitTextToSize(bodyText, 170)
            doc.text(splitText, 20, 60)

            // Signature Section
            doc.text("Sarah Jenkins", 20, 140)
            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text("Head of Talent Acquisition", 20, 145)

            // "Signed" placeholder
            doc.setDrawColor(0, 120, 255)
            doc.setLineWidth(0.5)
            doc.line(20, 135, 80, 135)

            // Save
            doc.save(`Offer_Letter_${candidateName.replace(/\s+/g, '_')}.pdf`)

            toast.success("Offer Letter Generated!")
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate PDF")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="w-full justify-start h-12 bg-green-600 hover:bg-green-700 text-white">
                    <FileDown className="mr-3 h-4 w-4" /> Generate Offer Letter
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Offer Letter</DialogTitle>
                    <DialogDescription>
                        Generate an official PDF offer letter for {candidateName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salary" className="text-right">
                            Salary ($)
                        </Label>
                        <Input
                            id="salary"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start-date" className="text-right">
                            Start Date
                        </Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={generateOffer} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Downlod PDF Bundle
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
