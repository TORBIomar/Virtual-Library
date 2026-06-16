import { useState, useEffect, useRef } from "react";
import type { Book } from "@/lib/types";
import { ChevronLeft, ChevronRight, Download, BookOpen, Maximize2, Minimize2, Type } from "lucide-react";
import { bookService } from "@/lib/api/services";

export function BookReader({ book }: { book: Book }) {
  const total = book.pages.length;
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem(`book_progress_${book.id}`);
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Math.min(parsed, Math.max(0, total - 1));
  });
  const [fontSize, setFontSize] = useState(16);
  const [zenMode, setZenMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(`book_progress_${book.id}`, page.toString());
    // Force scroll reset after the DOM updates
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
        scrollRef.current.scrollTop = 0;
      }
    }, 10);
  }, [book.id, page]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setPage((p) => Math.min(total - 1, p + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPage((p) => Math.max(0, p - 1));
      }
      if (e.key === "Escape") setZenMode(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [total]);

  const download = async () => {
    try {
      const response = await bookService.download(book.id);
      
      const ext = (book.fileExt || "pdf").toLowerCase();
      let mimeType = "application/octet-stream";
      if (ext === "pdf") mimeType = "application/pdf";
      else if (ext === "epub") mimeType = "application/epub+zip";
      else if (ext === "txt") mimeType = "text/plain";

      const blob = new Blob([response.data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title.replace(/\s+/g, "_")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file, falling back to text", err);
      const blob = new Blob([book.pages.join("\n\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title.replace(/\s+/g, "_")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const progress = total > 1 ? ((page + 1) / total) * 100 : 100;

  return (
    <div className={`h-full flex flex-col ${zenMode ? "bg-[oklch(0.08_0_0)]" : "bg-background"} transition-colors duration-500`}>
      {/* Progress bar */}
      <div className="h-[2px] bg-surface-elevated w-full">
        <div
          className="h-full bg-gradient-to-r from-white/30 to-white/60 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className={`px-6 h-14 flex items-center justify-between border-b border-border/20 ${zenMode ? "opacity-0 hover:opacity-100 transition-opacity duration-300" : ""}`}>
        <div className="min-w-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/8 to-white/[0.02] grid place-items-center border border-white/[0.06] shrink-0">
            <BookOpen className="w-4 h-4 text-white/60" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-semibold truncate text-sm">{book.title}</h2>
            <p className="text-[11px] text-muted-foreground truncate">{book.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Font size controls */}
          <div className="flex items-center gap-0.5 mr-2">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="p-1.5 rounded-md hover:bg-surface text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              title="Decrease font size"
            >
              <Type className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-muted-foreground w-6 text-center font-mono">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              className="p-1.5 rounded-md hover:bg-surface text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              title="Increase font size"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>
          {/* Zen mode */}
          <button
            onClick={() => setZenMode(!zenMode)}
            className="p-2 rounded-md hover:bg-surface text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            title={zenMode ? "Exit zen mode" : "Zen mode"}
          >
            {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {/* Download */}
          <button
            onClick={download}
            className="btn-shine relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-elevated border border-border/40 text-sm transition-all hover:border-white/10 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white/60" /> <span className="text-white/70">Download</span>
          </button>
        </div>
      </header>

      {/* Reading area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className={`mx-auto px-8 transition-all duration-500 ${zenMode ? "max-w-xl py-20" : "max-w-2xl py-14"}`}>
          {/* Page indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
              Page {page + 1} of {total}
            </div>
            <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            <div className="text-[11px] text-muted-foreground/40 font-mono">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Book content */}
          <article
            className="font-serif leading-[2.1] text-foreground/85 whitespace-pre-wrap animate-fade-in selection:bg-white/15 selection:text-white"
            style={{ fontSize: `${fontSize}px` }}
            key={page}
          >
            {book.pages[page]}
          </article>

          {/* Page end ornament */}
          <div className="flex items-center justify-center mt-12 gap-2">
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
            <div className="w-1 h-1 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Footer pagination */}
      <footer className={`px-6 h-16 flex items-center justify-between border-t border-border/20 ${zenMode ? "bg-[oklch(0.08_0_0)] opacity-0 hover:opacity-100 transition-opacity duration-300" : "glass-strong"}`}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-surface disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-sm text-white/60 hover:text-white cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex gap-1.5 items-center">
          {book.pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === page
                  ? "w-8 h-1.5 bg-white/70"
                  : i < page
                    ? "w-1.5 h-1.5 bg-white/25"
                    : "w-1.5 h-1.5 bg-white/10 hover:bg-white/25"
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          disabled={page === total - 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-surface disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-sm text-white/60 hover:text-white cursor-pointer"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
