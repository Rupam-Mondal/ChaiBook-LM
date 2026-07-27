import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, CornerDownLeft, MessageSquareText, Send, UserRound } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { askQuestion } from "@/lib/api"
import { cn } from "@/lib/utils"

import { getApiErrorMessage } from "@/lib/sources"

const starterPrompts = [
  "Summarize the main ideas",
  "List the important timestamps",
  "What should I remember from this?",
]

export function ChatPanel({ source }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState("")
  const [isAnswering, setIsAnswering] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef(null)
  const messagesRef = useRef(null)

  const canAsk = useMemo(
    () => Boolean(source?.sourceId && question.trim() && !isAnswering),
    [isAnswering, question, source?.sourceId]
  )

  const submitQuestion = async (event) => {
    event?.preventDefault()

    if (!source?.sourceId || !question.trim()) return

    const userQuestion = question.trim()
    setQuestion("")
    setError("")
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: crypto.randomUUID(), role: "user", content: userQuestion },
    ])

    try {
      setIsAnswering(true)
      const payload = await askQuestion({
        docID: source.sourceId,
        question: userQuestion,
      })
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload?.data || payload?.message || "No answer was returned.",
        },
      ])
    } catch (chatError) {
      setError(getApiErrorMessage(chatError))
    } finally {
      setIsAnswering(false)
      textareaRef.current?.focus()
    }
  }

  const handlePromptClick = (prompt) => {
    setQuestion(prompt)
    textareaRef.current?.focus()
  }

  useEffect(() => {
    const messageViewport = messagesRef.current
    if (!messageViewport) return

    messageViewport.scrollTo({
      top: messageViewport.scrollHeight,
      behavior: messages.length > 1 ? "smooth" : "auto",
    })
  }, [error, isAnswering, messages])

  return (
    <Card className="mx-auto flex h-full min-h-0 w-full max-w-4xl rounded-xl border-white/10 bg-card/75 py-0 text-left shadow-2xl shadow-black/20 backdrop-blur">
      <CardHeader className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <MessageSquareText className="size-5 text-emerald-200" />
              Chat with source
            </CardTitle>
            <p className="mt-1 max-w-xl truncate text-sm text-muted-foreground">
              {source ? source.title : "Upload a source first to unlock questions."}
            </p>
          </div>
          {source?.sourceId && (
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-muted-foreground">
              Active ID: <span className="text-white">{source.sourceId.slice(0, 8)}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div
          aria-live="polite"
          className="scrollbar-none min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-5"
          ref={messagesRef}
        >
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center rounded-xl border border-white/10 bg-black/20 px-5 text-center">
              <Bot className="mb-4 size-10 text-emerald-200" />
              <h2 className="text-xl font-semibold tracking-normal text-white">
                Ask anything from this source
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                ChaiBook will answer using the indexed chunks from your uploaded file or link.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {starterPrompts.map((prompt) => (
                  <Button
                    className="h-9 text-sm"
                    disabled={!source}
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    type="button"
                    variant="outline"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}

          {isAnswering && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner className="size-4 text-emerald-200" />
              Thinking through the indexed chunks
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
        </div>

        <form className="shrink-0 border-t border-white/10 bg-card/95 p-3 backdrop-blur sm:p-4" onSubmit={submitQuestion}>
          <div className="rounded-xl border border-white/10 bg-black/25 p-2">
            <Textarea
              className="max-h-36 min-h-20 resize-none border-0 bg-transparent px-3 py-2 text-sm text-white shadow-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-sm"
              disabled={!source || isAnswering}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  submitQuestion()
                }
              }}
              placeholder={
                source
                  ? "Ask about this source..."
                  : "Upload a file or link before asking questions"
              }
              ref={textareaRef}
              value={question}
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <CornerDownLeft className="size-4" />
                Enter to send
              </div>
              <Button className="ml-auto h-9 px-3 text-sm" disabled={!canAsk} type="submit">
                <Send className="size-4" />
                Ask
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ChatMessage({ message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/10 text-emerald-200">
          <Bot className="size-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-xl px-4 py-3 text-sm leading-6",
          isUser && "whitespace-pre-wrap",
          isUser
            ? "bg-white text-black"
            : "border border-white/10 bg-black/25 text-white"
        )}
      >
        {isUser ? message.content : <ChatMarkdown content={message.content} />}
      </div>
      {isUser && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
          <UserRound className="size-4" />
        </div>
      )}
    </div>
  )
}

function ChatMarkdown({ content }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, ...props }) => (
          <a
            className="font-medium text-emerald-200 underline underline-offset-2 hover:text-emerald-100"
            rel="noreferrer"
            target="_blank"
            {...props}
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-emerald-200/60 pl-3 text-white/75 first:mt-0 last:mb-0">
            {children}
          </blockquote>
        ),
        code: ({ children, className, ...props }) => {
          const isCodeBlock = String(children).includes("\n")

          return isCodeBlock ? (
            <code className={cn("block min-w-max p-3 font-mono text-xs leading-5", className)} {...props}>
              {children}
            </code>
          ) : (
            <code
              className={cn(
                "rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.8em] text-emerald-100",
                className
              )}
              {...props}
            >
              {children}
            </code>
          )
        },
        h1: ({ children }) => <h1 className="mb-3 text-xl font-semibold first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-3 font-semibold first:mt-0">{children}</h3>,
        hr: () => <hr className="my-4 border-white/15" />,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0">{children}</ol>,
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        pre: ({ children }) => (
          <pre className="my-3 max-w-full overflow-x-auto rounded-lg border border-white/10 bg-black/40 first:mt-0 last:mb-0">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="my-3 max-w-full overflow-x-auto first:mt-0 last:mb-0">
            <table className="w-full border-collapse text-left text-xs">{children}</table>
          </div>
        ),
        td: ({ children }) => <td className="border border-white/15 px-2 py-1.5 align-top">{children}</td>,
        th: ({ children }) => <th className="border border-white/15 bg-white/10 px-2 py-1.5 font-semibold">{children}</th>,
        ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5 first:mt-0 last:mb-0">{children}</ul>,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {String(content ?? "")}
    </ReactMarkdown>
  )
}
