'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Moon, Redo2, RotateCcw, Sun, Undo2 } from 'lucide-react'
import type { Screen } from '@/hooks/useLabState'

interface TopBarProps {
  screen: Screen
  theme: 'light' | 'dark'
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onToggleTheme: () => void
}

export function TopBar({
  screen,
  theme,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onToggleTheme,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label="Go to home screen"
        >
          <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase select-none">
            Birthday
          </span>
          <span className="font-mono text-xs font-semibold text-foreground select-none">
            Paradox Lab
          </span>
        </button>

        {/* Mode badge – only in lab */}
        {screen === 'lab' && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1">
            <span className="size-1.5 rounded-full bg-chart-2 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-xs text-muted-foreground">Simulated</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {screen === 'lab' && (
            <>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onUndo}
                      disabled={!canUndo}
                      aria-label="Undo"
                      className="size-8 p-0"
                    >
                      <Undo2 className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">Undo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRedo}
                      disabled={!canRedo}
                      aria-label="Redo"
                      className="size-8 p-0"
                    >
                      <Redo2 className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">Redo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onReset}
                      aria-label="Reset to home"
                      className="size-8 p-0"
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">Reset to home</TooltipContent>
              </Tooltip>

              <div className="w-px h-4 bg-border mx-1" aria-hidden="true" />
            </>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTheme}
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  className="size-8 p-0"
                >
                  {theme === 'light' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}
