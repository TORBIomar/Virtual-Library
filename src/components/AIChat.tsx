import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ChevronLeft, ChevronRight } from "lucide-react";
import type { Book } from "@/lib/types";

interface Msg { role: "user" | "ai"; text: string }

const SAMPLE_PROMPTS = [
  "Summarize this chapter",
  "Explain the main theme",
  "Who is the narrator?",
  "Suggest similar books",
];

export function AIChat({ book }: { book: Book }) {
  const [open, setOpen] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: `Hi — I'm Gemini, your reading companion for "${book.title}". Ask me anything about the text.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, {
        role: "ai",
        text: mockReply(text, book),
      }]);
      setThinking(false);
    }, 900 + Math.random() * 700);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-full w-12 glass border-l border-border/50 grid place-items-center hover:bg-surface transition-colors"
        aria-label="Open AI chat"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside className="h-full flex flex-col glass border-l border-border/50 w-full md:w-[380px]">
      <header className="px-4 h-14 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">Gemini Assistant</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Context-aware</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-surface" aria-label="Collapse chat">
          <ChevronRight className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-surface text-foreground rounded-bl-sm"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-surface px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-border/50">
        {SAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-surface hover:bg-surface-elevated border border-border/50 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="p-3 border-t border-border/50 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini about this book…"
          className="flex-1 bg-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="btn-shine w-10 h-10 rounded-lg bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
}

function mockReply(q: string, b: Book): string {
  const lower = q.toLowerCase();
  if (lower.includes("summar")) return `"${b.title}" by ${b.author} is ${b.description.toLowerCase()} The central arc traces a quiet transformation rendered through patient, image-rich prose.`;
  if (lower.includes("theme")) return `The dominant themes in "${b.title}" are memory, attention, and the way small choices accumulate into character. The book treats silence almost as a separate protagonist.`;
  if (lower.includes("narrator") || lower.includes("who")) return `The narrator stays close to the inner life of the principal figure, but ${b.author} occasionally slips into a wider, almost choral perspective.`;
  if (lower.includes("similar") || lower.includes("recommend")) return `If you enjoyed "${b.title}", you'd likely appreciate "Indigo Notebooks" and "On Stillness" — both share its restrained, meditative voice.`;
  return `That's a thoughtful question about "${b.title}". Based on the passage you're reading, the author is gesturing toward an idea of attentive presence — letting form mirror meaning rather than explain it.`;
}
