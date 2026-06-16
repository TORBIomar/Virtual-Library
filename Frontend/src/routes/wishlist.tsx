import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAuth } from "@/contexts/AuthContext";
import { BookCard } from "@/components/BookCard";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const { user } = useAuth();
  const { books, wishlist } = useLibrary();
  const saved = books.filter((b) => wishlist.includes(b.id));

  return (
    <div className="min-h-screen bg-aurora noise-overlay">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <header className="mb-10 animate-fade-in">
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">Read later</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mt-2">
            Your <span className="text-gradient">wishlist</span>
          </h1>
        </header>

        {!user ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <p className="text-muted-foreground mb-4">Sign in to save books for later.</p>
            <Link to="/login" className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium inline-block hover:bg-primary/90 transition-colors">Sign in</Link>
          </div>
        ) : saved.length === 0 ? (
          <div className="glass-strong rounded-2xl p-16 text-center">
            <Bookmark className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground mb-5">Your wishlist is empty.</p>
            <Link to="/library" className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium inline-block hover:bg-primary/90 transition-colors">
              Browse the library
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {saved.map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
