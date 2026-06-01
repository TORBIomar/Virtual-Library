import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { BookReader } from "@/components/BookReader";
import { AIChat } from "@/components/AIChat";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/reader/$bookId")({ component: ReaderPage });

function ReaderPage() {
  const { bookId } = useParams({ from: "/reader/$bookId" });
  const { books, reviews, addReview } = useLibrary();
  const { user } = useAuth();
  const book = books.find((b) => b.id === bookId);
  const bookReviews = reviews.filter((r) => r.bookId === bookId);
  const avg = bookReviews.length ? bookReviews.reduce((s, r) => s + r.rating, 0) / bookReviews.length : 0;

  if (!book) {
    return (
      <div className="min-h-screen bg-aurora">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-muted-foreground">Book not found.</p>
          <Link to="/library" className="text-primary hover:underline mt-2 inline-block">Back to library</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-aurora">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-w-0 border-r border-border/50">
          <BookReader book={book} />
        </div>
        <AIChat book={book} />
      </div>

      <section className="max-w-7xl w-full mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Reviews</div>
            <h2 className="font-display text-2xl font-semibold">Reader reflections</h2>
          </div>
          {bookReviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRow rating={Math.round(avg)} />
              <span className="text-sm text-muted-foreground">{avg.toFixed(1)} · {bookReviews.length} review{bookReviews.length !== 1 && "s"}</span>
            </div>
          )}
        </div>

        {user && <ReviewForm bookId={book.id} onSubmit={addReview} />}

        <div className="mt-6 space-y-3">
          {bookReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>
          ) : bookReviews.map((r) => (
            <div key={r.id} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{r.userName}</div>
                <StarRow rating={r.rating} small />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
              <div className="text-xs text-muted-foreground mt-2">{r.createdAt}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewForm({ bookId, onSubmit }: { bookId: string; onSubmit: (id: string, r: number, c: string) => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit(bookId, rating, comment.trim());
    setComment(""); setRating(5);
  };

  return (
    <form onSubmit={submit} className="glass rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Your rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className="transition-transform hover:scale-125">
              <Star className={`w-5 h-5 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share what stayed with you…"
        rows={3}
        className="w-full bg-input rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      <button type="submit" className="btn-shine relative px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Post review
      </button>
    </form>
  );
}

function StarRow({ rating, small = false }: { rating: number; small?: boolean }) {
  const size = small ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}
