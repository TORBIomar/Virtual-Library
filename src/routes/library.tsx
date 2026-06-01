import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { BookCard } from "@/components/BookCard";
import { useLibrary } from "@/contexts/LibraryContext";
import { CATEGORIES } from "@/lib/mockData";
import { Search } from "lucide-react";

export const Route = createFileRoute("/library")({ component: LibraryPage });

function LibraryPage() {
  const { books } = useLibrary();
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => books.filter((b) => {
    if (cat !== "All" && b.category !== cat) return false;
    if (q && !`${b.title} ${b.author}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [books, cat, q]);

  return (
    <div className="min-h-screen bg-aurora">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <header className="mb-10 animate-fade-in">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Library</div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Tonight's <span className="text-gradient">collection</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Hand-picked titles across fiction, philosophy, science and more. Save favorites for later, or open the Reader Room to begin.
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or author…"
              className="w-full bg-input rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  cat === c
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "glass hover:bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">No books match your filters.</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {filtered.map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
