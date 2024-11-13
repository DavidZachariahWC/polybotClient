'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, CheckCircle, Zap, BarChart, ArrowRight } from 'lucide-react'

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureCardProps {
  title: string;
  description: string;
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

interface FAQProps {
  question: string;
  answer: string;
}

export function LandingPageComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8" />
              <span className="text-2xl font-bold">Polybot</span>
            </div>
            <div className="hidden md:flex space-x-4">
              <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</Link>
              <Link href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
            </div>
            <Button>Get Started</Button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-6">The Most Accurate AI Assistant</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Polybot intelligently selects the best AI model for your question and uses advanced aggregation techniques to deliver unparalleled accuracy.
            </p>
            <Button size="lg" className="text-lg px-8">Experience Polybot Now</Button>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Polybot?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BenefitCard
                icon={<Zap className="h-8 w-8" />}
                title="Intelligent Model Selection"
                description="Polybot analyzes your question and selects the most appropriate AI model to provide the best answer."
              />
              <BenefitCard
                icon={<BarChart className="h-8 w-8" />}
                title="Answer Aggregation"
                description="Enhance accuracy by leveraging multiple responses and selecting the most consistent answer."
              />
              <BenefitCard
                icon={<CheckCircle className="h-8 w-8" />}
                title="Unmatched Accuracy"
                description="Benefit from a combination of intelligent selection and aggregation for highly reliable responses."
              />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                title="Multi-Model Intelligence"
                description="Access a wide range of specialized AI models, each selected based on your specific query for optimal results."
              />
              <FeatureCard
                title="Statistical Consensus"
                description="Utilize answer aggregation to focus on the most frequent and statistically likely correct responses."
              />
              <FeatureCard
                title="Reduced Error Rate"
                description="Minimize the impact of outlier responses and enhance overall reliability through multiple query iterations."
              />
              <FeatureCard
                title="Adaptive Learning"
                description="Continuously improve response accuracy by learning from aggregated results and user feedback."
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How Polybot Works</h2>
            <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8">
              <Step number={1} title="Ask Your Question" description="Submit your query to Polybot" />
              <ArrowRight className="hidden md:block h-8 w-8 text-muted-foreground" />
              <Step number={2} title="Intelligent Processing" description="Polybot selects the best AI model and aggregates multiple responses" />
              <ArrowRight className="hidden md:block h-8 w-8 text-muted-foreground" />
              <Step number={3} title="Receive Accurate Answer" description="Get the most consistent and reliable response" />
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Ready for Unparalleled AI Accuracy?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the power of intelligent model selection and answer aggregation with Polybot today.
            </p>
            <Button size="lg" className="text-lg px-8">Start Your Free Trial</Button>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <FAQ
                question="How does Polybot achieve higher accuracy than other AI assistants?"
                answer="Polybot uses two key techniques: intelligent model selection and answer aggregation. It chooses the most appropriate AI model for each query and then asks the question multiple times, selecting the most consistent answer for improved accuracy."
              />
              <FAQ
                question="What types of questions or tasks is Polybot best suited for?"
                answer="Polybot excels at a wide range of tasks due to its multi-model approach. It's particularly effective for complex queries that benefit from specialized knowledge, as well as questions where high accuracy is crucial."
              />
              <FAQ
                question="How does answer aggregation work, and why is it effective?"
                answer="Answer aggregation involves asking the same question multiple times and selecting the most common response. This technique leverages the fact that while individual AI responses can vary, the most frequent answer across multiple iterations is statistically more likely to be correct, reducing the impact of outliers and improving overall reliability."
              />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:underline">Features</Link></li>
                <li><Link href="#" className="hover:underline">Pricing</Link></li>
                <li><Link href="#" className="hover:underline">Use Cases</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:underline">About Us</Link></li>
                <li><Link href="#" className="hover:underline">Careers</Link></li>
                <li><Link href="#" className="hover:underline">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:underline">Blog</Link></li>
                <li><Link href="#" className="hover:underline">Documentation</Link></li>
                <li><Link href="#" className="hover:underline">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
                <li><Link href="#" className="hover:underline">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-sm">
            <p>&copy; 2023 Polybot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="text-center mb-8 md:mb-0">
      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
        {number}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FAQ({ question, answer }: FAQProps) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{question}</h3>
      <p className="text-muted-foreground">{answer}</p>
    </div>
  )
}