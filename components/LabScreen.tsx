'use client'

import { useState } from 'react'
import { LabLeftPanel } from '@/components/LabLeftPanel'
import { LabCenterPanel } from '@/components/LabCenterPanel'
import { LabRightPanel } from '@/components/LabRightPanel'
import { Button } from '@/components/ui/button'
import { LayoutList, PanelLeft, PanelRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LabState, ComputedResult } from '@/hooks/useLabState'
import type { Preset } from '@/lib/presets'

interface LabScreenProps {
  labState: LabState
  activePreset: Preset
  computed: ComputedResult
  onStateChange: (updater: LabState | ((prev: LabState) => LabState)) => void
  onStateLiveChange: (updater: LabState | ((prev: LabState) => LabState)) => void
}

type MobileTab = 'controls' | 'viz' | 'outputs'

export function LabScreen({ labState, activePreset, computed, onStateChange, onStateLiveChange }: LabScreenProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('viz')
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  return (
    <>
      {/* === DESKTOP: 3-panel layout === */}
      <div className="hidden lg:flex h-[calc(100vh-3rem)] overflow-hidden">
        {/* Left panel */}
        <div
          className={cn(
            'border-r border-border bg-card transition-all duration-200 overflow-hidden shrink-0',
            leftOpen ? 'w-56' : 'w-0'
          )}
          aria-hidden={!leftOpen}
        >
          {leftOpen && (
            <LabLeftPanel
              labState={labState}
              activePreset={activePreset}
              onStateChange={onStateChange}
              onStateLiveChange={onStateLiveChange}
            />
          )}
        </div>

        {/* Center panel */}
        <div className="flex-1 overflow-hidden relative">
          {/* Toggle buttons floating at top-left of center */}
          <div className="absolute top-3 left-3 z-10 flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeftOpen((v) => !v)}
              aria-label={leftOpen ? 'Collapse controls' : 'Expand controls'}
              className="size-7 p-0 shadow-sm"
            >
              <PanelLeft className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRightOpen((v) => !v)}
              aria-label={rightOpen ? 'Collapse outputs' : 'Expand outputs'}
              className="size-7 p-0 shadow-sm"
            >
              <PanelRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
          <LabCenterPanel labState={labState} activePreset={activePreset} computed={computed} />
        </div>

        {/* Right panel */}
        <div
          className={cn(
            'border-l border-border bg-card transition-all duration-200 overflow-hidden shrink-0',
            rightOpen ? 'w-64' : 'w-0'
          )}
          aria-hidden={!rightOpen}
        >
          {rightOpen && (
            <LabRightPanel
              labState={labState}
              activePreset={activePreset}
              computed={computed}
              onStateChange={onStateChange}
            />
          )}
        </div>
      </div>

      {/* === TABLET: 2-column compressed layout === */}
      <div className="hidden md:flex lg:hidden h-[calc(100vh-3rem)] overflow-hidden">
        {/* Left panel - compressed */}
        <div className="w-48 border-r border-border bg-card overflow-hidden shrink-0">
          <LabLeftPanel
            labState={labState}
            activePreset={activePreset}
            onStateChange={onStateChange}
            onStateLiveChange={onStateLiveChange}
          />
        </div>
        {/* Right: center + outputs stacked */}
        <div className="flex-1 overflow-y-auto">
          <LabCenterPanel labState={labState} activePreset={activePreset} computed={computed} />
          <div className="border-t border-border">
            <LabRightPanel
              labState={labState}
              activePreset={activePreset}
              computed={computed}
              onStateChange={onStateChange}
            />
          </div>
        </div>
      </div>

      {/* === MOBILE: Tab-based stacked layout === */}
      <div className="flex flex-col md:hidden h-[calc(100vh-3rem)]">
        {/* Sticky tab bar */}
        <nav
          className="sticky top-0 z-20 flex items-center border-b border-border bg-background/95 backdrop-blur-sm"
          role="tablist"
          aria-label="Lab sections"
        >
          {(
            [
              { id: 'controls', label: 'Controls', icon: <PanelLeft className="size-3.5" /> },
              { id: 'viz', label: 'Visualization', icon: <LayoutList className="size-3.5" /> },
              { id: 'outputs', label: 'Outputs', icon: <PanelRight className="size-3.5" /> },
            ] as { id: MobileTab; label: string; icon: React.ReactNode }[]
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={mobileTab === tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2',
                mobileTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto" role="tabpanel">
          {mobileTab === 'controls' && (
            <LabLeftPanel
              labState={labState}
              activePreset={activePreset}
              onStateChange={onStateChange}
              onStateLiveChange={onStateLiveChange}
            />
          )}
          {mobileTab === 'viz' && (
            <LabCenterPanel labState={labState} activePreset={activePreset} computed={computed} />
          )}
          {mobileTab === 'outputs' && (
            <LabRightPanel
              labState={labState}
              activePreset={activePreset}
              computed={computed}
              onStateChange={onStateChange}
            />
          )}
        </div>
      </div>
    </>
  )
}
