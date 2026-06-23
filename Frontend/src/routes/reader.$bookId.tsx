import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { BookReader } from "@/components/BookReader";
import { AIChat } from "@/components/AIChat";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star, BookOpen, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { bookService } from "@/lib/api/services";
import type { Book } from "@/lib/types";

export const Route = createFileRoute("/reader/$bookId")({ component: ReaderPage });

function ReaderPage() {
  const { bookId } = useParams({ from: "/reader/$bookId" });
  const { books } = useLibrary();
  const { user } = useAuth();
  
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      bookService.get(bookId)
        .then(setActiveBook)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [bookId]);

  const book = activeBook || books.find((b) => b.id === bookId);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      </div>
    );
  }


  if (!book) {
    return (
      <div className="min-h-screen bg-aurora noise-overlay">
        <Navbar />
        <div className="text-center py-32">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground mb-3">Book not found.</p>
          <Link to="/library" className="text-white/70 hover:text-white hover:underline mt-2 inline-flex items-center gap-1.5 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <Navbar />

      {/* Reader zone */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-w-0 border-r border-border/30">
          <BookReader book={book} />
        </div>
        <AIChat book={book} inline={true} />
      </div>

    </div>
  );
}


