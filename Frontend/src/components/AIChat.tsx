import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import type { Book } from "@/lib/types";
import { aiChatService } from "@/lib/api/services";

interface Msg { role: "user" | "ai"; text: string; sources?: string[] }

const SAMPLE_PROMPTS = [
  "Summarize this book",
  "Explain the main theme",
  "Who is the narrator?",
  "Suggest similar books",
];

export function AIChat({ book }: { book: Book }) {
  const [open, setOpen] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: `Hi — I'm ZenShelf AI, your reading companion for "${book.title}". Ask me anything about the text.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  const send = async (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: Msg = { role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    // Build chat history for context
    const chatHistory = msgs
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`);

    try {
      const result = await aiChatService.chat({
        question: text,
        bookId: book.id,
        chatHistory,
      });
      setMsgs((m) => [...m, {
        role: "ai",
        text: result.answer,
        sources: result.sources,
      }]);
    } catch {
      // Fallback to local mock if backend is down
      setMsgs((m) => [...m, {
        role: "ai",
        text: mockReply(text, book),
      }]);
    } finally {
      setThinking(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-full w-12 glass-strong border-l border-border/30 grid place-items-center hover:bg-surface transition-colors group"
        aria-label="Open AI chat"
      >
        <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
      </button>
    );
  }

  return (
    <aside className="h-full flex flex-col glass-strong border-l border-border/30 w-full md:w-[400px]">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] grid place-items-center animate-pulse-glow border border-white/[0.06]">
              <Sparkles className="w-4 h-4 text-white/80" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400/80 border-2 border-background" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
              ZenShelf AI
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-white/40 font-normal uppercase tracking-wider">Gemini</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Context-aware · RAG</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-surface transition-colors cursor-pointer" aria-label="Collapse chat">
          <ChevronRight className="w-4 h-4 text-white/40" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className="max-w-[88%] space-y-1.5">
              <div className={`px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-white/10 text-white/90 rounded-2xl rounded-br-md"
                  : "bg-surface text-foreground/85 rounded-2xl rounded-bl-md border border-border/20"
              }`}>
                {m.text}
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="flex items-center gap-1 px-1">
                  <Zap className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/25">
                    Sources: {m.sources.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-surface px-5 py-3.5 rounded-2xl rounded-bl-md flex gap-1.5 border border-border/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2.5 flex flex-wrap gap-1.5 border-t border-border/20">
        {SAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={thinking}
            className="text-[11px] px-3 py-1.5 rounded-full bg-surface hover:bg-surface-elevated border border-border/30 hover:border-white/10 transition-all text-white/50 hover:text-white/80 cursor-pointer disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="p-3 border-t border-border/30 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this book…"
          disabled={thinking}
          className="flex-1 bg-input rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 transition-shadow border border-transparent focus:border-white/10 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          className="btn-shine w-10 h-10 rounded-lg bg-primary text-primary-foreground grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors cursor-pointer"
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
