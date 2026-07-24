import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  FileArchive,
  FileText,
  Link2,
  Sparkles,
  Upload,
  X,
} from "lucide-react"

import { ProcessingTimeline } from "@/components/ProcessingTimeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { uploadSource } from "@/lib/api"
import { cn } from "@/lib/utils"
import { getApiErrorMessage, isGithubUrl, normalizeUploadSources } from "@/lib/sources"

const supportedTypes = ".pdf,.doc,.docx,.ppt,.pptx,.txt,.vtt,.srt"
const GITHUB_INDEX_URL = "https://example.com"

export function UploadPanel({ onSourcesReady }) {
  const [mode, setMode] = useState("link")
  const [link, setLink] = useState("")
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [phase, setPhase] = useState("parsing")
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const canSubmit = useMemo(() => {
    if (isUploading) return false
    return mode === "link" ? link.trim().length > 0 : files.length > 0
  }, [files.length, isUploading, link, mode])

  useEffect(() => {
    if (!isUploading) return undefined

    const chunkingTimer = window.setTimeout(() => setPhase("chunking"), 1400)
    const embeddingsTimer = window.setTimeout(() => setPhase("embeddings"), 3300)

    return () => {
      window.clearTimeout(chunkingTimer)
      window.clearTimeout(embeddingsTimer)
    }
  }, [isUploading])

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files || []))
    setError("")
  }

  const handleFiles = (nextFiles) => {
    setFiles(Array.from(nextFiles || []))
    setError("")
  }

  const removeFile = (fileToRemove) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file !== fileToRemove))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (!canSubmit) {
      setError(mode === "link" ? "Paste a source link first." : "Select at least one file.")
      return
    }

    if (mode === "link" && isGithubUrl(link.trim())) {
      window.location.assign(GITHUB_INDEX_URL)
      return
    }

    try {
      setPhase("parsing")
      setIsUploading(true)
      const payload = await uploadSource({ mode, link: link.trim(), files })
      const nextSources = normalizeUploadSources(payload)

      if (nextSources.length === 0) {
        throw new Error("Upload succeeded but no source ID was returned.")
      }

      setPhase("completed")
      onSourcesReady(nextSources)
      setLink("")
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError))
    } finally {
      window.setTimeout(() => setIsUploading(false), 700)
    }
  }

  return (
    <Card className="rounded-xl border-white/10 bg-card/75 py-0 text-left shadow-2xl shadow-black/20 backdrop-blur">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-white">Connect your material</CardTitle>
            <CardDescription className="mt-1 text-sm">
              Choose one source type. ChaiBook will index it before opening chat.
            </CardDescription>
          </div>
          <Badge variant="outline" className="h-6 border-emerald-300/30 text-emerald-200">
            RAG ready
          </Badge>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
            <Button
              className={cn("h-9 text-sm", mode === "link" && "bg-white text-black hover:bg-white/90")}
              onClick={() => {
                setMode("link")
                setError("")
              }}
              type="button"
              variant={mode === "link" ? "secondary" : "ghost"}
            >
              <Link2 className="size-4" />
              Link
            </Button>
            <Button
              className={cn("h-9 text-sm", mode === "files" && "bg-white text-black hover:bg-white/90")}
              onClick={() => {
                setMode("files")
                setError("")
              }}
              type="button"
              variant={mode === "files" ? "secondary" : "ghost"}
            >
              <Upload className="size-4" />
              Files
            </Button>
          </div>

          {mode === "link" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white" htmlFor="source-link">
                Source link
              </label>
              <div className="relative">
                <Input
                  className="h-11 rounded-xl border-white/10 bg-black/25 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground md:text-sm"
                  id="source-link"
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="Paste YouTube or website link"
                  type="url"
                  value={link}
                />
                <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-4 shrink-0 text-emerald-200" />
                We will prepare this source for grounded answers.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white" htmlFor="source-files">
                Source files
              </label>
              <button
                className={cn(
                  "flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition",
                  isDragging
                    ? "border-emerald-200 bg-emerald-300/10"
                    : "border-white/15 bg-black/25 hover:border-emerald-300/50 hover:bg-emerald-300/5"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                  handleFiles(event.dataTransfer.files)
                }}
                type="button"
              >
                <FileArchive className="size-7 text-emerald-200" />
                <span className="text-base font-medium text-white">Select files</span>
                <span className="max-w-sm text-sm text-muted-foreground">
                  Drop files here or browse. PDF, DOCX, PPTX, TXT, VTT and SRT supported.
                </span>
              </button>
              <Input
                accept={supportedTypes}
                className="sr-only"
                id="source-files"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              {files.length > 0 && (
                <div className="scrollbar-none max-h-32 space-y-2 overflow-y-auto pr-1">
                  {files.map((file) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                      key={`${file.name}-${file.lastModified}`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="size-4 shrink-0 text-emerald-200" />
                        <span className="truncate text-sm text-white">{file.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          aria-label={`Remove ${file.name}`}
                          className="rounded-md p-1 text-muted-foreground transition hover:bg-white/10 hover:text-white"
                          onClick={() => removeFile(file)}
                          title={`Remove ${file.name}`}
                          type="button"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isUploading && <ProcessingTimeline activePhase={phase} />}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-base text-red-100">
              <X className="mt-0.5 size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </CardContent>
        <CardFooter className="sticky bottom-0 flex-col items-stretch gap-3 rounded-b-xl border-t border-white/10 bg-card/95 p-4 backdrop-blur">
          <Button className="h-10 w-full text-sm font-semibold" disabled={!canSubmit} type="submit">
            {isUploading ? "Preparing your source" : "Start indexing"}
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function formatFileSize(size) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
