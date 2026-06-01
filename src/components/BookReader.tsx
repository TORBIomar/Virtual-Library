import { useState } from "react";
import type { Book } from "@/lib/types";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

export function BookReader({ book }: { book: Book }) {
  const [page, setPage] = useState(0);
  const total = book.pages.length;

  const download = () => {
    const blob = new Blob([book.pages.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 h-14 flex items-center justify-between border-b border-border/50 glass">
        <div className="min-w-0">
          <h2 className="font-display font-semibold truncate">{book.title}</h2>
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        </div>
        <button
          onClick={download}
          className="btn-shine relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-elevated border border-border/50 text-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Download
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Page {page + 1} of {total}
          </div>
          <article className="prose prose-invert font-serif text-[15px] leading-[1.9] text-foreground/90 whitespace-pre-wrap animate-fade-in" key={page}>
            {book.pages[page]}
          </article>
        </div>
      </div>

      <footer className="px-6 h-16 flex items-center justify-between border-t border-border/50 glass">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex gap-1">
          {book.pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full transition-all ${i === page ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"}`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          disabled={page === total - 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
