'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PRESETS, formatLargeNumber } from '@/lib/presets'
import type { LabState, Mode } from '@/hooks/useLabState'
import type { Preset } from '@/lib/presets'
import { cn } from '@/lib/utils'

interface LabLeftPanelProps {
  labState: LabState
  activePreset: Preset
  onStateChange: (updater: LabState | ((prev: LabState) => LabState)) => void
  onStateLiveChange: (updater: LabState | ((prev: LabState) => LabState)) => void
}

const PRESET_SHORT_NAMES: Record<string, string> = {
  'birthday-room': 'Birthdays',
  'hash-collision': 'Hash fn',
  'invite-codes': 'Invite codes',
  'url-shortener': 'URL slugs',
  'uuid-risk': 'UUID v4',
}

export function LabLeftPanel({ labState, activePreset, onStateChange, onStateLiveChange }: LabLeftPanelProps) {
  const maxSample = Math.min(activePreset.spaceSize, activePreset.sampleSize * 10, 1e9)

  function handlePresetSelect(id: string) {
    const p = PRESETS.find((x) => x.id === id)!
    onStateChange((prev) => ({
      ...prev,
      presetId: id,
      sampleSize: p.sampleSize,
      spaceSize: p.spaceSize,
    }))
  }

  // During drag: update the displayed value live without pushing to history
  function handleSampleDrag(value: number[]) {
    onStateLiveChange((prev) => ({ ...prev, sampleSize: value[0] }))
  }

  // On mouse-up / keyboard commit: push to history
  function handleSampleCommit(value: number[]) {
    onStateChange((prev) => ({ ...prev, sampleSize: value[0] }))
  }

  function handleModeChange(mode: string) {
    onStateChange((prev) => ({ ...prev, mode: mode as Mode }))
  }

  function handleQuickAction(qa: { sampleSize?: number; spaceSize?: number }) {
    onStateChange((prev) => ({
      ...prev,
      sampleSize: qa.sampleSize ?? prev.sampleSize,
      spaceSize: qa.spaceSize ?? prev.spaceSize,
    }))
  }

  return (
    <aside className="flex flex-col gap-0 h-full overflow-y-auto" aria-label="Lab controls">
      {/* Preset selector */}
      <section className="p-4 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
          Scenario
        </p>
        <div className="flex flex-col gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors text-sm',
                labState.presetId === p.id
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={labState.presetId === p.id ? 'true' : undefined}
            >
              <span className="shrink-0 font-mono text-base leading-none" aria-hidden="true">
                {p.id === 'hash-collision' ? '#' : p.id === 'invite-codes' ? '🔑' : p.id === 'url-shortener' ? '🔗' : p.id === 'uuid-risk' ? '🆔' : '🎂'}
              </span>
              <span className="truncate text-xs font-medium">{PRESET_SHORT_NAMES[p.id]}</span>
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Space info */}
      <section className="p-4 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
          Space size
        </p>
        <p className="font-mono text-xl font-semibold text-foreground leading-none">
          {formatLargeNumber(labState.spaceSize)}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{activePreset.spaceSizeLabel}</p>
      </section>

      <Separator />

      {/* Sample size slider */}
      <section className="p-4 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sample size
          </p>
          <span className="font-mono text-sm text-foreground font-semibold">
            {formatLargeNumber(labState.sampleSize)}
          </span>
        </div>
        <Slider
          min={1}
          max={maxSample}
          step={Math.max(1, Math.floor(maxSample / 200))}
          value={[labState.sampleSize]}
          onValueChange={handleSampleDrag}
          onValueCommit={handleSampleCommit}
          aria-label="Sample size"
          className="mb-2"
        />
        <p className="text-xs text-muted-foreground">{activePreset.sampleSizeLabel}</p>
      </section>

      <Separator />

      {/* Quick actions */}
      <section className="p-4 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
          Quick actions
        </p>
        <div className="flex flex-col gap-1.5">
          {activePreset.quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(qa)}
              className="group flex flex-col items-start rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={qa.label}
            >
              <span className="text-xs font-medium text-foreground">{qa.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{qa.description}</span>
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Mode toggle */}
      <section className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
          Mode
        </p>
        <Tabs
          value={labState.mode}
          onValueChange={handleModeChange}
        >
          <TabsList className="w-full">
            <TabsTrigger value="simulated" className="flex-1 text-xs">
              Simulated
            </TabsTrigger>
            <TabsTrigger value="live" className="flex-1 text-xs" disabled>
              Live (soon)
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {labState.mode === 'simulated' && (
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Using pre-computed mocked outcomes. Fully functional without any API.
          </p>
        )}
      </section>
    </aside>
  )
}
