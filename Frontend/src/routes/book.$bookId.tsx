import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star, BookOpen, ArrowLeft, BookMarked, Play } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/book/$bookId")({ component: BookDetailsPage });

function BookDetailsPage() {
  const { bookId } = useParams({ from: "/book/$bookId" });
  const { books, reviews, addReview, loadReviewsForBook, toggleWishlist, isWishlisted } = useLibrary();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const book = books.find((b) => b.id === bookId);

  useEffect(() => {
    if (bookId) {
      loadReviewsForBook(bookId);
    }
  }, [bookId, loadReviewsForBook]);

  const bookReviews = reviews.filter((r) => r.bookId === bookId);
  const avg = bookReviews.length ? bookReviews.reduce((s, r) => s + r.rating, 0) / bookReviews.length : 0;

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

  const saved = isWishlisted(book.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 animate-fade-in">
        <Link to="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to library
        </Link>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Cover */}
          <div className="w-full md:w-1/3 max-w-[300px] shrink-0 mx-auto md:mx-0">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-strong relative shadow-2xl shadow-black/50">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
                  {book.category} · {book.year}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">{book.title}</h1>
              <p className="text-xl text-muted-foreground mt-2">by {book.author}</p>
            </div>

            <div className="flex items-center gap-3">
              <StarRow rating={Math.round(avg)} />
              <span className="text-sm text-muted-foreground">
                {avg.toFixed(1)} ({bookReviews.length} review{bookReviews.length !== 1 && "s"})
              </span>
            </div>

            <div className="prose prose-invert prose-sm text-foreground/80 max-w-none">
              <p className="leading-relaxed">{book.description}</p>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-border/30">
              <button 
                onClick={() => navigate({ to: "/reader/$bookId", params: { bookId: book.id } })}
                className="btn-shine relative flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                Read Now
              </button>
              
              <button
                onClick={() => toggleWishlist(book.id)}
                className={`p-3 rounded-full border transition-all cursor-pointer ${
                  saved 
                    ? "bg-white/10 border-white/20 text-white" 
                    : "glass border-transparent text-muted-foreground hover:text-white"
                }`}
                title={saved ? "Remove from wishlist" : "Add to wishlist"}
              >
                <BookMarked className={`w-5 h-5 ${saved ? "fill-white" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Reviews section */}
      <section className="bg-aurora noise-overlay border-t border-border/30 mt-12">
        <div className="max-w-5xl w-full mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">Reviews</span>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mt-2">Reader reflections</h2>
            </div>
            {bookReviews.length > 0 && (
              <div className="flex items-center gap-2.5">
                <StarRow rating={Math.round(avg)} />
                <span className="text-sm text-muted-foreground">{avg.toFixed(1)} · {bookReviews.length} review{bookReviews.length !== 1 && "s"}</span>
              </div>
            )}
          </div>

          {user && <ReviewForm bookId={book.id} onSubmit={addReview} />}

          <div className="mt-8 space-y-4">
            {bookReviews.length === 0 ? (
              <div className="glass-strong rounded-2xl p-12 text-center">
                <Star className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your thoughts.</p>
              </div>
            ) : bookReviews.map((r) => (
              <div key={r.id} className="glass-strong rounded-xl p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/12 to-white/[0.03] grid place-items-center text-xs font-semibold text-white/70 border border-white/[0.06]">
                      {r.userName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.userName}</div>
                      <div className="text-[10px] text-muted-foreground">{r.createdAt}</div>
                    </div>
                  </div>
                  <StarRow rating={r.rating} small />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed pl-11">{r.comment}</p>
              </div>
            ))}
          </div>
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
    <form onSubmit={submit} className="glass-strong rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Your rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className="transition-transform hover:scale-125 cursor-pointer">
              <Star className={`w-5 h-5 ${n <= rating ? "fill-white/80 text-white/80" : "text-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share what stayed with you…"
        rows={3}
        className="w-full bg-input rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 resize-none border border-transparent focus:border-white/10 transition-all"
      />
      <button type="submit" className="btn-shine relative px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
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
        <Star key={n} className={`${size} ${n <= rating ? "fill-white/70 text-white/70" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}
