'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatLargeNumber, formatProbability, type Preset } from '@/lib/presets'
import type { ComputedResult, LabState } from '@/hooks/useLabState'
import { BookOpen, ChevronDown, ChevronUp, Lightbulb, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LabRightPanelProps {
  labState: LabState
  activePreset: Preset
  computed: ComputedResult
  onStateChange: (updater: LabState | ((prev: LabState) => LabState)) => void
}

function Section({
  icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="size-3.5 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function InlineLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-28 pt-px">{label}</span>
      <span className="text-xs text-foreground font-medium font-mono break-all">{value}</span>
    </div>
  )
}

export function LabRightPanel({ labState, activePreset, computed, onStateChange }: LabRightPanelProps) {
  const [showExplain, setShowExplain] = useState(false)

  const { collisionProbability: prob, pairCount: pairs, birthdayBound: bound, riskLevel } = computed

  const RISK_LABELS = { low: 'Low', medium: 'Medium', high: 'High' }
  const RISK_COLORS = {
    low: 'text-[oklch(0.52_0.14_155)] dark:text-[oklch(0.65_0.14_155)]',
    medium: 'text-[oklch(0.58_0.16_55)] dark:text-[oklch(0.72_0.16_55)]',
    high: 'text-[oklch(0.52_0.22_25)] dark:text-[oklch(0.65_0.22_25)]',
  }

  return (
    <aside className="flex flex-col overflow-y-auto h-full bg-card border-l border-border" aria-label="Lab outputs and explanations">
      <Section
        icon={<BookOpen className="size-3.5" />}
        title="Result summary"
        defaultOpen
      >
        <div className="flex flex-col">
          <InlineLabel label="Scenario" value={activePreset.name} />
          <InlineLabel label="Space size" value={formatLargeNumber(labState.spaceSize)} />
          <InlineLabel label="Samples (n)" value={formatLargeNumber(labState.sampleSize)} />
          <InlineLabel label="Unique pairs" value={formatLargeNumber(pairs)} />
          <InlineLabel label="Collision risk" value={formatProbability(prob)} />
          <InlineLabel label="Birthday bound" value={`≈ ${formatLargeNumber(Math.round(bound))}`} />
          <div className="flex items-start gap-2 pt-1.5">
            <span className="text-xs text-muted-foreground shrink-0 w-28">Risk level</span>
            <span className={cn('text-xs font-semibold', RISK_COLORS[riskLevel])}>
              {RISK_LABELS[riskLevel]}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full text-xs gap-1.5"
          onClick={() => setShowExplain((v) => !v)}
        >
          <Lightbulb className="size-3.5" aria-hidden="true" />
          {showExplain ? 'Hide explanation' : 'Explain this result'}
        </Button>

        {showExplain && (
          <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activePreset.explanation}
            </p>
          </div>
        )}
      </Section>

      <Section
        icon={<BookOpen className="size-3.5" />}
        title="Plain-language lesson"
        defaultOpen
      >
        <div className="rounded-lg border border-border bg-muted/50 p-3 mb-3">
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            &ldquo;{activePreset.lesson}&rdquo;
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {activePreset.whyFasterThanExpected}
        </p>
      </Section>

      <Section
        icon={<Wrench className="size-3.5" />}
        title="Practical context"
        defaultOpen={false}
      >
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {activePreset.practicalContext}
        </p>

        {/* Operational threshold callout */}
        {riskLevel !== 'low' && (
          <div
            className={cn(
              'rounded-lg border px-3 py-2.5',
              riskLevel === 'high'
                ? 'border-[oklch(0.52_0.22_25_/_0.3)] bg-[oklch(0.52_0.22_25_/_0.06)]'
                : 'border-[oklch(0.58_0.16_55_/_0.3)] bg-[oklch(0.58_0.16_55_/_0.06)]'
            )}
          >
            <p className={cn('text-xs font-semibold mb-0.5', RISK_COLORS[riskLevel])}>
              Operationally meaningful risk
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              At {formatProbability(prob)} collision probability, this space requires active collision handling in production.
            </p>
          </div>
        )}

        {riskLevel === 'low' && (
          <div className="rounded-lg border border-[oklch(0.52_0.14_155_/_0.3)] bg-[oklch(0.52_0.14_155_/_0.06)] px-3 py-2.5">
            <p className="text-xs font-semibold text-[oklch(0.52_0.14_155)] mb-0.5 dark:text-[oklch(0.65_0.14_155)]">
              Safe operating range
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You&apos;re well below the birthday bound of {formatLargeNumber(Math.round(bound))}. Increase n to see the risk grow.
            </p>
          </div>
        )}
      </Section>

      <Section
        icon={<Lightbulb className="size-3.5" />}
        title="Key concepts"
        defaultOpen={false}
      >
        {[
          {
            term: 'Birthday bound',
            def: `The sample count at which collision probability crosses 50%. Always ≈ √(2 × N × ln 2), not N/2.`,
          },
          {
            term: 'Pair count',
            def: `With n samples, there are n(n−1)/2 unique pairs. Each pair independently tests for collision. This quadratic growth is the core of the paradox.`,
          },
          {
            term: 'Collision probability',
            def: `P(at least one collision) = 1 − ∏(k=0→n−1) (1 − k/N). More precisely computed as 1 − e^(−n²/2N) via approximation.`,
          },
          {
            term: 'Approximation intuition',
            def: `When n << N, the probability is approximately 1 − e^(−n(n−1) / 2N) ≈ n² / 2N for small n.`,
          },
        ].map((item) => (
          <div key={item.term} className="mb-3 last:mb-0">
            <p className="text-xs font-semibold text-foreground mb-0.5">{item.term}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.def}</p>
          </div>
        ))}
      </Section>

      {/* Notes */}
      <div className="p-4 mt-auto border-t border-border">
        <label htmlFor="lab-notes" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
          Notes
        </label>
        <textarea
          id="lab-notes"
          value={labState.notes}
          onChange={(e) =>
            onStateChange((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Add notes about this scenario..."
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring leading-relaxed"
        />
      </div>
    </aside>
  )
}
