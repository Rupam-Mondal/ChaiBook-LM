import { CheckCircle2, Circle, Loader2 } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const phases = [
  { key: "parsing", label: "Reading", detail: "Extracting text and structure" },
  { key: "chunking", label: "Chunking", detail: "Finding useful context windows" },
  { key: "embeddings", label: "Embedding", detail: "Making ideas searchable" },
  { key: "completed", label: "Ready", detail: "Your source is ready to chat" },
]

export function ProcessingTimeline({ activePhase }) {
  const activeIndex = Math.max(
    phases.findIndex((phase) => phase.key === activePhase),
    0
  )
  const values = [20, 52, 82, 100]
  const value = values[activeIndex]
  const active = phases[activeIndex]

  return (
    <div aria-live="polite" className="space-y-4 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{active.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{active.detail}</p>
        </div>
        <p className="text-xs font-medium tabular-nums text-emerald-200">{value}%</p>
      </div>
      <Progress value={value} className="[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-indicator]]:bg-emerald-300" />
      <div className="grid grid-cols-4 gap-1">
        {phases.map((phase, index) => {
          const isDone = index < activeIndex || activePhase === "completed"
          const isActive = index === activeIndex && activePhase !== "completed"

          return (
            <div
              className={cn(
                "flex min-w-0 flex-col items-start gap-1.5 text-xs",
                isDone ? "text-emerald-200" : "text-muted-foreground",
                isActive && "text-white"
              )}
              key={phase.key}
            >
              {isDone ? (
                <CheckCircle2 className="size-4" />
              ) : isActive ? (
                <Loader2 className="size-4 animate-spin text-emerald-200" />
              ) : (
                <Circle className="size-4" />
              )}
              <span className="truncate">{phase.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
