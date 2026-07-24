import { Database, FileText, Layers3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SourceSummary({ sources, activeSourceId, onSelectSource }) {
  return (
    <Card className="rounded-xl border-white/10 bg-card/60 py-0 text-left backdrop-blur">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Database className="size-4 text-emerald-200" />
          Stored sources
        </CardTitle>
        <CardDescription className="text-sm">
          Choose which uploaded source the assistant should answer from.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {sources.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
            No source added yet. Upload a file or send a link to start chatting.
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {sources.map((source) => {
              const isActive = source.sourceId === activeSourceId

              return (
                <button
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition",
                    isActive
                      ? "border-emerald-300/45 bg-emerald-300/10"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                  key={source.sourceId}
                  onClick={() => onSelectSource(source.sourceId)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                        <FileText className="size-4 text-emerald-200" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{source.title}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {source.sourceId}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isActive ? "default" : "outline"} className="shrink-0">
                      {source.type}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers3 className="size-4" />
                    {source.totalChunks} chunks indexed
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
