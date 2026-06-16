import { Link } from "@tanstack/react-router";
import { Bookmark, BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAuth } from "@/contexts/AuthContext";

export function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const { isWishlisted, toggleWishlist } = useLibrary();
  const { user } = useAuth();
  const saved = isWishlisted(book.id);

  return (
    <article
      className="hover-lift group relative rounded-2xl overflow-hidden bg-card border border-border/40 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Link to="/book/$bookId" params={{ bookId: book.id }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-70" />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass-strong text-[10px] uppercase tracking-widest font-medium text-white/70">
            {book.category}
          </div>
        </div>
      </Link>

      {user && (
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(book.id); }}
          aria-label={saved ? "Remove from wishlist" : "Save for later"}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center transition-all cursor-pointer ${
            saved ? "bg-white/90 text-black shadow-glow scale-100" : "glass-strong hover:scale-110 text-white/60 hover:text-white"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        </button>
      )}

      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold leading-tight line-clamp-2">{book.title}</h3>
        <p className="text-xs text-muted-foreground">{book.author} · {book.year}</p>
        <Link
          to="/reader/$bookId"
          params={{ bookId: book.id }}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white hover:gap-2.5 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" /> Read now
        </Link>
      </div>
    </article>
  );
}
