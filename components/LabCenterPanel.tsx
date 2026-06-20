'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  formatLargeNumber,
  formatProbability,
  generateCurveData,
  type Preset,
  getRiskLevel,
} from '@/lib/presets'
import type { ComputedResult, LabState } from '@/hooks/useLabState'
import { cn } from '@/lib/utils'

interface LabCenterPanelProps {
  labState: LabState
  activePreset: Preset
  computed: ComputedResult
}

const RISK_COLORS = {
  low: 'text-[oklch(0.52_0.14_155)] dark:text-[oklch(0.65_0.14_155)]',
  medium: 'text-[oklch(0.58_0.16_55)] dark:text-[oklch(0.72_0.16_55)]',
  high: 'text-[oklch(0.52_0.22_25)] dark:text-[oklch(0.65_0.22_25)]',
}

const RISK_BG = {
  low: 'bg-[oklch(0.52_0.14_155_/_0.1)] border-[oklch(0.52_0.14_155_/_0.25)]',
  medium: 'bg-[oklch(0.58_0.16_55_/_0.1)] border-[oklch(0.58_0.16_55_/_0.25)]',
  high: 'bg-[oklch(0.52_0.22_25_/_0.1)] border-[oklch(0.52_0.22_25_/_0.25)]',
}

function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const labels = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        RISK_BG[level],
        RISK_COLORS[level]
      )}
    >
      {labels[level]}
    </span>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-popover-foreground">
      <p className="font-mono text-xs text-muted-foreground mb-1">n = {formatLargeNumber(Number(label))}</p>
      <p className="text-sm font-medium">{formatProbability(payload[0].value)}</p>
    </div>
  )
}

export function LabCenterPanel({ labState, activePreset, computed }: LabCenterPanelProps) {
  const curveData = useMemo(
    () => generateCurveData(labState.spaceSize, labState.sampleSize),
    [labState.spaceSize, labState.sampleSize]
  )

  const currentN = labState.sampleSize
  const prob = computed.collisionProbability
  const pairs = computed.pairCount
  const bound = computed.birthdayBound
  const riskLevel = computed.riskLevel
  const intuitive = computed.intuitiveGuess

  // Find index in curve closest to current sample
  const currentPoint = useMemo(() => {
    if (!curveData.length) return null
    let closest = curveData[0]
    let minDiff = Math.abs(curveData[0].n - currentN)
    for (const pt of curveData) {
      const diff = Math.abs(pt.n - currentN)
      if (diff < minDiff) { minDiff = diff; closest = pt }
    }
    return closest
  }, [curveData, currentN])

  return (
    <main className="flex flex-col gap-5 min-h-0 p-4 sm:p-5 overflow-y-auto" aria-label="Probability visualization">

      {/* Probability curve */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">Collision Probability Curve</CardTitle>
          <CardDescription className="text-xs">
            Probability that at least two samples collide as n grows
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-52 w-full" style={{ minWidth: 0 }} role="img" aria-label={`Probability curve showing ${formatProbability(prob)} collision chance at n=${formatLargeNumber(currentN)}`}>
            <ResponsiveContainer width="100%" height={208} minWidth={0}>
              <AreaChart data={curveData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
                <XAxis
                  dataKey="n"
                  tickFormatter={(v) => formatLargeNumber(v)}
                  tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
                {/* 50% reference line */}
                <ReferenceLine y={50} stroke="var(--color-muted-foreground)" strokeDasharray="4 3" strokeOpacity={0.5} />
                {/* Current sample reference */}
                {currentPoint && (
                  <ReferenceLine
                    x={currentPoint.n}
                    stroke="var(--color-chart-1)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.8}
                    strokeWidth={1.5}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#probGrad)"
                  dot={false}
                  activeDot={{ r: 3, fill: 'var(--color-chart-1)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono text-right">
            Dashed line = 50% threshold · Vertical = current n
          </p>
        </CardContent>
      </Card>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Collision prob */}
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Collision probability
            </p>
            <p className={cn('text-3xl font-semibold font-mono leading-none mb-1', RISK_COLORS[riskLevel])}>
              {formatProbability(prob)}
            </p>
            <RiskBadge level={riskLevel} />
          </CardContent>
        </Card>

        {/* Pair count */}
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Unique pairs
            </p>
            <p className="text-3xl font-semibold font-mono leading-none text-foreground mb-1">
              {formatLargeNumber(pairs)}
            </p>
            <p className="text-xs text-muted-foreground">n × (n−1) / 2</p>
          </CardContent>
        </Card>

        {/* Birthday bound */}
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Birthday bound (50%)
            </p>
            <p className="text-3xl font-semibold font-mono leading-none text-foreground mb-1">
              {formatLargeNumber(Math.round(bound))}
            </p>
            <p className="text-xs text-muted-foreground">≈ √(2 × N × ln 2)</p>
          </CardContent>
        </Card>

        {/* Intuition gap */}
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Space filled
            </p>
            <p className="text-3xl font-semibold font-mono leading-none text-foreground mb-1">
              {formatProbability(intuitive)}
            </p>
            <p className="text-xs text-muted-foreground">Intuitive (wrong) guess</p>
          </CardContent>
        </Card>
      </div>

      {/* Intuition comparison */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Intuition vs. Reality</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Intuitive guess (space filled)</span>
              <span className="font-mono text-xs text-muted-foreground">{formatProbability(intuitive)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-muted-foreground/30 transition-all duration-500"
                style={{ width: `${Math.min(100, intuitive)}%` }}
                role="progressbar"
                aria-valuenow={intuitive}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-foreground font-medium">Actual collision probability</span>
              <span className="font-mono text-xs text-foreground font-medium">{formatProbability(prob)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  riskLevel === 'low'
                    ? 'bg-[oklch(0.52_0.14_155)]'
                    : riskLevel === 'medium'
                    ? 'bg-[oklch(0.58_0.16_55)]'
                    : 'bg-[oklch(0.52_0.22_25)]'
                )}
                style={{ width: `${Math.min(100, prob)}%` }}
                role="progressbar"
                aria-valuenow={prob}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
            The actual collision probability is{' '}
            <strong className="text-foreground font-medium">
              {intuitive > 0 ? `${(prob / Math.max(intuitive, 0.0001)).toFixed(0)}×` : 'far'} higher
            </strong>{' '}
            than what filling the space suggests — because pairs, not individuals, drive collisions.
          </p>
        </CardContent>
      </Card>

      {/* Simulation outcome */}
      <Card className="shadow-none border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Simulation Outcome</CardTitle>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-chart-2" aria-hidden="true" />
              Simulated
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {activePreset.simulationOutcome}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
