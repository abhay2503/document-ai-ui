"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageSquareText, SendHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askFollowUp, getErrorMessage } from "@/lib/api/client";

const SUGGESTIONS = [
  "What are the main risks?",
  "Explain this in simpler terms",
  "Are there any deadlines?",
];

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface FollowUpChatProps {
  jobId: string;
  documentName: string;
}

export function FollowUpChat({ jobId, documentName }: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || pending) return;

    setMessages((m) => [...m, { id: nextId.current++, role: "user", content: q }]);
    setQuestion("");
    setError("");
    setPending(true);

    try {
      const answer = await askFollowUp(jobId, q);
      setMessages((m) => [...m, { id: nextId.current++, role: "assistant", content: answer }]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(question);
  }

  return (
    <section
      aria-labelledby="follow-up-heading"
      className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700"
    >
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
          <MessageSquareText className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 id="follow-up-heading" className="text-lg font-semibold tracking-tight">
            Ask AI a follow-up question
          </h2>
          <p className="truncate text-xs text-muted-foreground">Answers are based on {documentName}</p>
        </div>
      </div>

      {messages.length > 0 && (
        <div
          ref={threadRef}
          className="mt-5 max-h-96 space-y-3 overflow-y-auto pr-1"
          aria-live="polite"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1",
                message.role === "user" ? "justify-end" : "justify-start gap-2.5",
              )}
            >
              {message.role === "assistant" && <AssistantAvatar />}
              <p
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                  message.role === "user"
                    ? "bg-brand-gradient rounded-br-md text-white shadow-sm shadow-primary/20"
                    : "rounded-tl-md bg-muted",
                )}
              >
                {message.content}
              </p>
            </div>
          ))}
          {pending && (
            <div className="flex gap-2.5" aria-label="AI is answering">
              <AssistantAvatar />
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-muted px-4 py-3.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {messages.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void ask(s)}
              disabled={pending}
              className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:border-primary/40 hover:bg-accent/50 hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <label htmlFor="follow-up-question" className="sr-only">
          Your question
        </label>
        <Input
          id="follow-up-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about this document…"
          maxLength={500}
          autoComplete="off"
          className="h-11 flex-1 rounded-xl bg-card px-3.5 shadow-xs"
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={!question.trim() || pending}
          aria-label="Send question"
          className="bg-brand-gradient size-11 rounded-xl text-white shadow-md shadow-primary/25 hover:opacity-90"
        >
          <SendHorizontal aria-hidden />
        </Button>
      </form>
    </section>
  );
}

function AssistantAvatar() {
  return (
    <span className="bg-brand-gradient mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-white">
      <Sparkles className="size-3.5" aria-hidden />
    </span>
  );
}
