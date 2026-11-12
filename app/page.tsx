import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Users, Briefcase, Target, TrendingUp, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-violet-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-600" />
            <span className="text-2xl font-bold text-violet-900">hirex.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-violet-700 hover:bg-violet-100">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-violet-600 hover:bg-violet-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-200">AI-Powered Recruitment</Badge>
        <h1 className="mb-6 text-balance text-5xl font-bold text-violet-900 lg:text-6xl">
          Reimagining GCCs.
          <br />
          Redefining Possibilities.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-violet-700 leading-relaxed">
          An AI-powered operating system for hiring, integration, and execution inside Global Capability Centers.
          Transform your recruitment process with intelligent automation.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
              Explore Platform
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="border-violet-300 text-violet-700 hover:bg-violet-100 bg-transparent"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-violet-900">Intelligent Hiring Platform</h2>
          <p className="mx-auto max-w-2xl text-violet-700">
            Streamline your recruitment process with AI-powered tools designed for modern GCCs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader>
              <Sparkles className="mb-2 h-10 w-10 text-violet-600" />
              <CardTitle className="text-violet-900">AI Resume Analysis</CardTitle>
              <CardDescription className="text-violet-600">
                Gemini-powered ATS scoring with intelligent skill matching
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-violet-700">
              Automatically analyze resumes and generate ATS scores based on job requirements
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-violet-600" />
              <CardTitle className="text-violet-900">Smart Candidate Tracking</CardTitle>
              <CardDescription className="text-violet-600">
                Track candidates through every stage of recruitment
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-violet-700">
              Manage applications, schedule interviews, and send automated emails
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader>
              <Briefcase className="mb-2 h-10 w-10 text-violet-600" />
              <CardTitle className="text-violet-900">Job Management</CardTitle>
              <CardDescription className="text-violet-600">Create and manage job postings with ease</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-violet-700">
              Post jobs, track openings, and manage your talent pipeline
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader>
              <Target className="mb-2 h-10 w-10 text-violet-600" />
              <CardTitle className="text-violet-900">AI Interview Questions</CardTitle>
              <CardDescription className="text-violet-600">Generate personalized interview questions</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-violet-700">
              AI creates tailored questions based on job role and candidate profile
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader>
              <TrendingUp className="mb-2 h-10 w-10 text-violet-600" />
              <CardTitle className="text-violet-900">Analytics Dashboard</CardTitle>
              <CardDescription className="text-violet-600">Real-time insights into recruitment metrics</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-violet-700">
              Track KPIs, conversion rates, and hiring pipeline performance
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-white shadow-lg">
            <CardHeader>
              <Clock className="mb-2 h-10 w-10 text-violet-600" />
              <CardTitle className="text-violet-900">Automated Workflows</CardTitle>
              <CardDescription className="text-violet-600">Email templates and appointment letters</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-violet-700">
              Send rejection, interview, and offer letters automatically
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <Card className="border-violet-300 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="mb-4 text-3xl font-bold text-white">Ready to Transform Your Recruitment?</CardTitle>
            <CardDescription className="text-violet-100">
              Join leading GCCs using hirex.ai to hire smarter and faster
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="bg-white text-violet-700 hover:bg-violet-50">
                Start Free Trial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-200 bg-white py-8">
        <div className="container mx-auto px-6 text-center text-sm text-violet-600">
          <p>&copy; 2025 hirex.ai - GCC X Shift Hackathon Project</p>
          <p className="mt-2">AI-Powered Recruitment Platform for Global Capability Centers</p>
        </div>
      </footer>
    </div>
  )
}
