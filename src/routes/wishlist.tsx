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
    <div className="min-h-screen bg-aurora">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <header className="mb-10 animate-fade-in">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Read later</div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Your <span className="text-gradient">wishlist</span>
          </h1>
        </header>

        {!user ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground mb-4">Sign in to save books for later.</p>
            <Link to="/login" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium inline-block">Sign in</Link>
          </div>
        ) : saved.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <Bookmark className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-5">Your wishlist is empty.</p>
            <Link to="/library" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium inline-block hover:bg-primary/90 transition-colors">
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
