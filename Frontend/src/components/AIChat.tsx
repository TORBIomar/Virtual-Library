import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Minimize2, Zap, MessageSquare } from "lucide-react";
import type { Book } from "@/lib/types";
import { aiChatService } from "@/lib/api/services";

interface Msg { role: "user" | "ai"; text: string; sources?: string[] }

const GENERAL_PROMPTS = [
  "Recommend a book for me",
  "What genres do you have?",
  "Find me a mystery novel",
  "Best books to start with",
];

const BOOK_PROMPTS = [
  "Summarize this book",
  "Explain the main theme",
  "Who is the narrator?",
  "Suggest similar books",
];

function mockReply(q: string, book?: Book): string {
  const lower = q.toLowerCase();
  if (book) {
    if (lower.includes("summar")) return `"${book.title}" by ${book.author} — ${book.description?.toLowerCase() ?? "a compelling read."}`;
    if (lower.includes("theme")) return `The dominant themes in "${book.title}" include memory, transformation, and the weight of small choices.`;
    if (lower.includes("narrator") || lower.includes("who")) return `The narrator in "${book.title}" offers a close, introspective view guided by ${book.author}'s signature style.`;
    if (lower.includes("similar") || lower.includes("recommend")) return `If you enjoyed "${book.title}", you'd likely appreciate works with a similar meditative, character-driven voice.`;
    return `That's a thoughtful question about "${book.title}". The author weaves ideas of attentive presence throughout the text.`;
  }
  if (lower.includes("recommend") || lower.includes("suggest")) return "I'd be happy to recommend something! What genres or moods are you in the mood for? Fiction, mystery, science, history?";
  if (lower.includes("genre") || lower.includes("categor")) return "The library has a wide range of genres — fiction, non-fiction, science, history, mystery, self-help, and more. What interests you?";
  if (lower.includes("mystery")) return "Great taste! Mystery and thriller readers often enjoy slow-burn suspense and clever reveals. Browse the 'Mystery' category in the library for our full collection.";
  if (lower.includes("best") || lower.includes("start")) return "For newcomers, I'd suggest starting with highly-rated titles in your favorite genre. Check the library homepage for featured and top-rated books!";
  return "I'm ZenShelf AI, your reading companion. Ask me anything about books in the library, or let me help you find your next great read!";
}

interface AIChatProps {
  book?: Book;
  /** When true, renders as inline sidebar (reader mode). When false/undefined renders as floating widget. */
  inline?: boolean;
}

export function AIChat({ book, inline = false }: AIChatProps) {
  const [open, setOpen] = useState(inline);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: book
        ? `Hi — I'm ZenShelf AI, your reading companion for "${book.title}". Ask me anything about the text.`
        : "Hi! I'm ZenShelf AI — your personal library companion. Ask me to recommend books, explain genres, or answer any reading-related question!",
    },
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

    const chatHistory = msgs
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`);

    try {
      const result = await aiChatService.chat({
        question: text,
        bookId: book?.id,
        chatHistory,
      });
      setMsgs((m) => [...m, { role: "ai", text: result.answer, sources: result.sources }]);
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: mockReply(text, book) }]);
    } finally {
      setThinking(false);
    }
  };

  const prompts = book ? BOOK_PROMPTS : GENERAL_PROMPTS;

  // ── Inline sidebar mode (reader page) ───────────────────────────────────────
  if (inline) {
    return (
      <aside className="h-full flex flex-col glass-strong border-l border-border/30 w-full md:w-[400px]">
        <ChatHeader book={book} onClose={inline ? undefined : () => setOpen(false)} />
        <ChatMessages msgs={msgs} thinking={thinking} endRef={endRef} />
        <QuickPrompts prompts={prompts} onSelect={send} disabled={thinking} />
        <ChatInput value={input} onChange={setInput} onSend={send} disabled={thinking} />
      </aside>
    );
  }

  // ── Floating widget mode (global) ────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className="flex flex-col glass-strong border border-border/30 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in"
          style={{ width: "360px", height: "520px" }}
        >
          <ChatHeader book={book} onClose={() => setOpen(false)} />
          <ChatMessages msgs={msgs} thinking={thinking} endRef={endRef} />
          <QuickPrompts prompts={prompts} onSelect={send} disabled={thinking} />
          <ChatInput value={input} onChange={setInput} onSend={send} disabled={thinking} />
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className="btn-shine relative w-14 h-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-xl shadow-black/40 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        {open ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-60" />
          </>
        )}
      </button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ChatHeader({ book, onClose }: { book?: Book; onClose?: () => void }) {
  return (
    <header className="px-4 h-14 flex items-center justify-between border-b border-border/30 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] grid place-items-center animate-pulse-glow border border-white/[0.06]">
            <Sparkles className="w-4 h-4 text-foreground/80" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400/80 border-2 border-background" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
            ZenShelf AI
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/5 border border-foreground/8 text-foreground/40 font-normal uppercase tracking-wider">Gemini</span>
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {book ? "Context-aware · RAG" : "Library companion"}
          </div>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface transition-colors cursor-pointer" aria-label="Close chat">
          <X className="w-4 h-4 text-foreground/40" />
        </button>
      )}
    </header>
  );
}

function ChatMessages({ msgs, thinking, endRef }: {
  msgs: Msg[];
  thinking: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
      {msgs.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
          <div className="max-w-[88%] space-y-1.5">
            <div className={`px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-foreground/10 text-foreground/90 rounded-2xl rounded-br-md"
                : "bg-surface text-foreground/85 rounded-2xl rounded-bl-md border border-border/20"
            }`}>
              {m.text}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div className="flex items-center gap-1 px-1">
                <Zap className="w-3 h-3 text-foreground/20" />
                <span className="text-[10px] text-foreground/25">Sources: {m.sources.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      {thinking && (
        <div className="flex justify-start">
          <div className="bg-surface px-5 py-3.5 rounded-2xl rounded-bl-md flex gap-1.5 border border-border/20">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

function QuickPrompts({ prompts, onSelect, disabled }: { prompts: string[]; onSelect: (p: string) => void; disabled: boolean }) {
  return (
    <div className="px-4 py-2.5 flex flex-wrap gap-1.5 border-t border-border/20">
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          disabled={disabled}
          className="text-[11px] px-3 py-1.5 rounded-full bg-background hover:bg-surface border border-border/50 hover:border-foreground/20 transition-all text-foreground/70 hover:text-foreground cursor-pointer disabled:opacity-40 shadow-sm"
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function ChatInput({ value, onChange, onSend, disabled }: {
  value: string;
  onChange: (v: string) => void;
  onSend: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSend(value); }}
      className="p-3 border-t border-border/30 flex gap-2 shrink-0"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask anything about books…"
        disabled={disabled}
        className="flex-1 bg-input rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 transition-shadow border border-transparent focus:border-foreground/10 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="btn-shine w-10 h-10 rounded-lg bg-primary text-primary-foreground grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
