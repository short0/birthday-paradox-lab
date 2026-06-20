'use client'

import { useLabState } from '@/hooks/useLabState'
import { TopBar } from '@/components/TopBar'
import { HomeScreen } from '@/components/HomeScreen'
import { LabScreen } from '@/components/LabScreen'

export default function BirthdayParadoxLab() {
  const {
    screen,
    theme,
    labState,
    activePreset,
    computed,
    canUndo,
    canRedo,
    initialized,
    setScreen,
    toggleTheme,
    loadPreset,
    setLabState,
    undo,
    redo,
    resetToHome,
  } = useLabState()

  // Prevent hydration mismatch — render nothing until localStorage is read
  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex gap-1.5" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-1.5 rounded-full bg-muted-foreground/40 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  function handleOpenBlankLab() {
    setScreen('lab')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopBar
        screen={screen}
        theme={theme}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={resetToHome}
        onToggleTheme={toggleTheme}
      />

      {screen === 'home' ? (
        <HomeScreen onLoadPreset={loadPreset} onOpenBlankLab={handleOpenBlankLab} />
      ) : (
        <LabScreen
          labState={labState}
          activePreset={activePreset}
          computed={computed}
          onStateChange={setLabState}
        />
      )}
    </div>
  )
}
