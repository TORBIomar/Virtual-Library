import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Book, Review, User } from "@/lib/types";
import { MOCK_BOOKS, MOCK_REVIEWS, MOCK_USERS } from "@/lib/mockData";
import { useAuth } from "./AuthContext";

interface LibraryState {
  books: Book[];
  reviews: Review[];
  users: User[];
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  addBook: (b: Omit<Book, "id" | "pages">) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  removeBook: (id: string) => void;
  addReview: (bookId: string, rating: number, comment: string) => void;
  removeReview: (id: string) => void;
  removeUser: (id: string) => void;
  setUserRole: (id: string, role: User["role"]) => void;
}

const LibCtx = createContext<LibraryState | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const wishlistKey = user ? `smartlib_wishlist_${user.id}` : null;

  useEffect(() => {
    if (!wishlistKey) { setWishlist([]); return; }
    const raw = localStorage.getItem(wishlistKey);
    setWishlist(raw ? JSON.parse(raw) : []);
  }, [wishlistKey]);

  const persistWishlist = (next: string[]) => {
    setWishlist(next);
    if (wishlistKey) localStorage.setItem(wishlistKey, JSON.stringify(next));
  };

  const toggleWishlist = (id: string) => {
    persistWishlist(wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id]);
  };
  const isWishlisted = (id: string) => wishlist.includes(id);

  const addBook: LibraryState["addBook"] = (b) => {
    setBooks((prev) => [
      { ...b, id: crypto.randomUUID(), pages: ["New manuscript — content pending upload processing.\n\n" + b.description] },
      ...prev,
    ]);
  };
  const updateBook = (id: string, patch: Partial<Book>) =>
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const removeBook = (id: string) => setBooks((prev) => prev.filter((b) => b.id !== id));

  const addReview: LibraryState["addReview"] = (bookId, rating, comment) => {
    if (!user) return;
    setReviews((prev) => [
      {
        id: crypto.randomUUID(),
        bookId,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };
  const removeReview = (id: string) => setReviews((prev) => prev.filter((r) => r.id !== id));
  const removeUser = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));
  const setUserRole = (id: string, role: User["role"]) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));

  return (
    <LibCtx.Provider value={{
      books, reviews, users, wishlist,
      toggleWishlist, isWishlisted,
      addBook, updateBook, removeBook,
      addReview, removeReview, removeUser, setUserRole,
    }}>
      {children}
    </LibCtx.Provider>
  );
}

export const useLibrary = () => {
  const ctx = useContext(LibCtx);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};
