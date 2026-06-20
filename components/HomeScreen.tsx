'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PRESETS } from '@/lib/presets'
import { ArrowRight, FlaskConical, Hash, KeyRound, Link2, Shuffle } from 'lucide-react'

const PRESET_ICONS = [
  <span key="b" className="text-xl" aria-hidden="true">🎂</span>,
  <Hash key="h" className="size-5 text-muted-foreground" aria-hidden="true" />,
  <KeyRound key="k" className="size-5 text-muted-foreground" aria-hidden="true" />,
  <Link2 key="l" className="size-5 text-muted-foreground" aria-hidden="true" />,
  <span key="id" className="text-xl" aria-hidden="true">🆔</span>,
]

const RISK_LABELS: Record<string, { label: string; className: string }> = {
  low: { label: 'Low risk', className: 'bg-[oklch(from_var(--risk-low)_l_c_h_/_0.12)] text-[oklch(from_var(--risk-low)_calc(l_-_0.15)_c_h)] border-[oklch(from_var(--risk-low)_l_c_h_/_0.25)]' },
  medium: { label: 'Medium risk', className: 'bg-[oklch(from_var(--risk-medium)_l_c_h_/_0.12)] text-[oklch(from_var(--risk-medium)_calc(l_-_0.15)_c_h)] border-[oklch(from_var(--risk-medium)_l_c_h_/_0.25)]' },
  high: { label: 'High risk', className: 'bg-[oklch(from_var(--risk-high)_l_c_h_/_0.12)] text-[oklch(from_var(--risk-high)_calc(l_-_0.1)_c_h)] border-[oklch(from_var(--risk-high)_l_c_h_/_0.25)]' },
}

interface HomeScreenProps {
  onLoadPreset: (id: string) => void
  onOpenBlankLab: () => void
}

export function HomeScreen({ onLoadPreset, onOpenBlankLab }: HomeScreenProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Hero */}
      <section className="mb-14 text-center" aria-labelledby="hero-heading">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 mb-6">
          <FlaskConical className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono text-xs text-muted-foreground tracking-wide">Interactive probability lab</span>
        </div>

        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl font-semibold text-foreground text-balance leading-tight mb-5"
        >
          The Birthday Paradox
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-4">
          In a room of just 23 people, there is a{' '}
          <strong className="text-foreground font-medium">greater than 50% chance</strong> that two people share a
          birthday. It feels wrong — but the math is unambiguous.
        </p>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
          This same pattern governs hash collisions, duplicate invite codes, URL shortener clashes, and random ID
          conflicts in production systems. Explore it interactively below.
        </p>
      </section>

      {/* Preset cards */}
      <section aria-labelledby="presets-heading">
        <div className="flex items-center justify-between mb-5">
          <h2 id="presets-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Choose a scenario
          </h2>
          <Button variant="ghost" size="sm" onClick={onOpenBlankLab} className="text-muted-foreground gap-1.5">
            <Shuffle className="size-3.5" aria-hidden="true" />
            Open blank lab
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((preset, i) => {
            const risk = RISK_LABELS[preset.riskLevel]
            return (
              <button
                key={preset.id}
                onClick={() => onLoadPreset(preset.id)}
                className="group text-left rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-foreground/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                aria-label={`Load preset: ${preset.name}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-muted shrink-0">
                    {PRESET_ICONS[i]}
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-1" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1 text-balance">{preset.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 text-pretty">{preset.tagline}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${risk.className}`}
                  >
                    {risk.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {preset.collisionProbability.toFixed(1)}% at {preset.sampleSize.toLocaleString()}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <Separator className="my-12" />

      {/* How it works */}
      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Choose a space',
              body:
                'Pick a scenario with a finite set of possibilities — 365 birthdays, 65,536 hash values, or 56 billion invite codes.',
            },
            {
              step: '02',
              title: 'Add samples',
              body:
                'Draw random values from that space. As samples accumulate, the number of pairs grows as n² — not linearly.',
            },
            {
              step: '03',
              title: 'Watch collisions emerge',
              body:
                'The birthday bound — where collision probability passes 50% — is always around √(space size), not half of it.',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <span className="font-mono text-xs text-muted-foreground/50 pt-0.5 shrink-0 w-6">{item.step}</span>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 flex flex-col sm:flex-row items-center gap-3 justify-center">
        <Button
          size="lg"
          onClick={() => onLoadPreset('birthday-room')}
          className="w-full sm:w-auto gap-2"
        >
          Start with the classic
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="lg" onClick={onOpenBlankLab} className="w-full sm:w-auto">
          Open blank lab
        </Button>
      </div>
    </main>
  )
}
