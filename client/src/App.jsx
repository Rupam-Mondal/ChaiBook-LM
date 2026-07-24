import { useState } from "react"
import { BrainCircuit, Plus } from "lucide-react"

import { ChatPanel } from "@/components/ChatPanel"
import { UploadPanel } from "@/components/UploadPanel"
import { Button } from "@/components/ui/button"

import "./App.css"

function App() {
  const [sources, setSources] = useState([])
  const [activeSourceId, setActiveSourceId] = useState("")

  const handleSourcesReady = (nextSources) => {
    setSources((currentSources) => {
      const knownIds = new Set(currentSources.map((source) => source.sourceId))
      const freshSources = nextSources.filter((source) => !knownIds.has(source.sourceId))

      return [...freshSources, ...currentSources]
    })

    if (nextSources[0]?.sourceId) {
      setActiveSourceId(nextSources[0].sourceId)
    }
  }

  const activeSource = sources.find((source) => source.sourceId === activeSourceId)

  return (
    <main className="dark h-dvh overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 py-3 sm:px-6 sm:py-4">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/10 text-emerald-200">
              <BrainCircuit className="size-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium uppercase text-emerald-200/80">
                Private study space
              </p>
              <h1 className="text-xl font-semibold tracking-normal text-white sm:text-2xl">
                ChaiBook LM
              </h1>
            </div>
          </div>
          {activeSource && (
            <Button
              className="h-9 text-sm"
              onClick={() => {
                setActiveSourceId("")
                setSources([])
              }}
              type="button"
              variant="outline"
            >
              <Plus className="size-4" />
              New source
            </Button>
          )}
        </header>

        <section className="flex min-h-0 flex-1 items-center justify-center py-3 sm:py-4">
          {activeSource ? (
            <ChatPanel key={activeSource.sourceId} source={activeSource} />
          ) : (
            <div className="scrollbar-none max-h-full w-full max-w-xl overflow-y-auto py-4">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                  Add a source
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                  Upload a document or paste a supported link. Once ChaiBook finishes indexing it, your chat opens automatically.
                </p>
              </div>
              <UploadPanel onSourcesReady={handleSourcesReady} />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
