// ─────────────────────────────────────────────────────
// Landing Page — Public homepage
// ─────────────────────────────────────────────────────

import Link from 'next/link';
import {
  FileText,
  Shield,
  Lightbulb,
  TrendingDown,
  Calendar,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// ── Feature cards data ─────────────────────────────────

const features = [
  {
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Simple Explanation',
    desc: 'Get a plain-English summary of any bill or contract — no financial jargon.',
  },
  {
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
    title: 'Risk Detection',
    desc: 'Automatically flags cancellation fees, penalty clauses, and contract traps.',
  },
  {
    icon: TrendingDown,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: 'Hidden Fees',
    desc: 'Surfaces charges you didn\'t know you were paying — like optional add-ons.',
  },
  {
    icon: Calendar,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: 'Important Dates',
    desc: 'Never miss a renewal deadline or payment due date again.',
  },
  {
    icon: Lightbulb,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: 'Savings Tips',
    desc: 'Specific, actionable advice to reduce your bills immediately.',
  },
  {
    icon: BarChart2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: 'Market Comparison',
    desc: 'See how your rate compares to the national average.',
  },
];

// ── Example analysis output ────────────────────────────

const exampleFindings = [
  {
    type: 'warning',
    text: 'You are paying €0.42/kWh — 24% above the national average of €0.34/kWh.',
    color: 'border-orange-300 bg-orange-50 text-orange-800',
  },
  {
    type: 'date',
    text: 'Your contract ends in 2 months (April 15). Switch now to avoid auto-renewal at a higher rate.',
    color: 'border-purple-300 bg-purple-50 text-purple-800',
  },
  {
    type: 'saving',
    text: 'You are paying €7/month for an optional "Green Plus" add-on. You can cancel this online.',
    color: 'border-green-300 bg-green-50 text-green-800',
  },
  {
    type: 'risk',
    text: 'Early termination fee of €150 applies if you cancel before the contract end date.',
    color: 'border-red-300 bg-red-50 text-red-800',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Nav ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Explain<span className="text-blue-600">MyBill</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="gradient">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pb-24 pt-20">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />
          </div>

          <div className="container text-center">
            <Badge variant="blue" className="mb-6 text-sm px-4 py-1.5">
              Powered by Claude AI
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Understand any bill or contract{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                in seconds
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Upload your energy bill, phone contract, insurance policy or any financial document.
              Get a clear explanation, hidden fees detection, and money-saving tips — instantly.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="xl" variant="gradient" className="gap-2 w-full sm:w-auto">
                  Start for free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Sign in to dashboard
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free plan includes 3 analyses per month · No credit card required
            </p>
          </div>
        </section>

        {/* ── Example output ─────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">What you get for every document</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Example analysis for an energy bill
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              {/* Mock document card */}
              <div className="mb-4 rounded-xl border bg-muted/30 p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">energy_bill_february.pdf</p>
                  <p className="text-xs text-muted-foreground">Energy Bill · Risk: 7/10</p>
                </div>
                <Badge variant="destructive" className="ml-auto">High Risk</Badge>
              </div>

              {/* Example findings */}
              <div className="space-y-3">
                {exampleFindings.map((finding, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 text-sm font-medium ${finding.color}`}
                  >
                    {finding.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything you need to understand your bills</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, color, bg, title, desc }) => (
                <Card key={title} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Supported files ────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Works with any document format</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Upload a file, take a photo, or paste text directly from your email.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'PDF Bills', icon: '📄' },
                { label: 'Screenshots', icon: '🖼️' },
                { label: 'Phone photos', icon: '📸' },
                { label: 'Pasted text', icon: '📋' },
                { label: 'Email content', icon: '📧' },
              ].map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium"
                >
                  <span>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            </div>
            <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
              {/* Free plan */}
              <Card className="border-2">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-1">Free</h3>
                  <p className="text-muted-foreground text-sm mb-6">For occasional use</p>
                  <div className="text-4xl font-extrabold mb-6">€0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                  <ul className="space-y-3 mb-8">
                    {['3 documents per month', 'Full AI analysis', 'Hidden fee detection', 'Risk scoring'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full" variant="outline">Start for free</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro plan */}
              <Card className="border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="pro" className="px-4 py-1">Most popular</Badge>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-1">Pro</h3>
                  <p className="text-muted-foreground text-sm mb-6">For regular use</p>
                  <div className="text-4xl font-extrabold mb-6">€9<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                  <ul className="space-y-3 mb-8">
                    {['Unlimited documents', 'Full AI analysis', 'Hidden fee detection', 'Risk scoring', 'Priority processing', 'Document history'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full" variant="gradient">
                      <Zap className="mr-2 h-4 w-4" />
                      Get Pro
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="container text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Stop overpaying. Start understanding.</h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">
              Join thousands of users who already understand exactly what they're paying for.
            </p>
            <Link href="/register">
              <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50 gap-2">
                Get started for free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-600 to-indigo-600">
              <FileText className="h-3 w-3 text-white" />
            </div>
            ExplainMyBill — Your documents, explained simply.
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js + Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}
