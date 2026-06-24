import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Book, Review, User } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { bookService, reviewService, userService, wishlistService } from "@/lib/api/services";
import { apiClient } from "@/lib/api/client";

interface LibraryState {
  books: Book[];
  reviews: Review[];
  users: User[];
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  addBook: (form: FormData) => Promise<void>;
  updateBook: (id: string, form: FormData) => Promise<void>;
  removeBook: (id: string) => void;
  addReview: (bookId: string, rating: number, comment: string) => void;
  removeReview: (id: string) => void;
  addUser: (name: string, email: string, password: string, role: string) => Promise<void>;
  removeUser: (id: string) => void;
  setUserRole: (id: string, role: User["role"]) => void;
  loadReviewsForBook: (bookId: string) => void;
}

const LibCtx = createContext<LibraryState | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // 1. Initial load of books
  useEffect(() => {
    bookService.list().then(setBooks).catch(console.error);
  }, []);

  // 2. Load user-specific data upon authentication changes
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setUsers([]);
      setReviews([]);
      return;
    }

    // Load wishlist
    wishlistService.list().then(setWishlist).catch(console.error);

    // If Admin, load users and reviews for moderation
    if (user.role === "ADMIN") {
      userService.list().then(setUsers).catch(console.error);
      apiClient.get<any[]>("/admin/reviews")
        .then(res => setReviews(res.data.map(r => ({
          id: r.id,
          bookId: r.bookId,
          userId: r.userId,
          userName: r.username,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt ? r.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
        }))))
        .catch(console.error);
    }
  }, [user]);

  const toggleWishlist = async (id: string) => {
    if (!user) return;
    const isSaved = wishlist.includes(id);
    try {
      if (isSaved) {
        await wishlistService.remove(id);
        setWishlist(prev => prev.filter(x => x !== id));
      } else {
        await wishlistService.add(id);
        setWishlist(prev => [...prev, id]);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    }
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  const addBook = async (form: FormData) => {
    try {
      const newBook = await bookService.create(form);
      setBooks(prev => [newBook, ...prev]);
    } catch (err) {
      console.error("Failed to add book", err);
      throw err;
    }
  };

  const updateBook = async (id: string, form: FormData) => {
    try {
      const updated = await bookService.update(id, form);
      setBooks(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err) {
      console.error("Failed to update book", err);
      throw err;
    }
  };

  const removeBook = async (id: string) => {
    try {
      await bookService.remove(id);
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error("Failed to remove book", err);
    }
  };

  const addReview = async (bookId: string, rating: number, comment: string) => {
    try {
      const newReview = await reviewService.create(bookId, rating, comment);
      setReviews(prev => [newReview, ...prev]);
    } catch (err) {
      console.error("Failed to add review", err);
    }
  };

  const removeReview = async (id: string) => {
    try {
      await reviewService.remove(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to remove review", err);
    }
  };

  const addUser = async (name: string, email: string, password: string, role: string) => {
    try {
      const newUser = await userService.create(name, email, password, role);
      setUsers(prev => [newUser, ...prev]);
    } catch (err) {
      console.error("Failed to add user", err);
      throw err;
    }
  };

  const removeUser = async (id: string) => {
    try {
      await userService.remove(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error("Failed to remove user", err);
    }
  };

  const setUserRole = (id: string, role: User["role"]) => {
    // Local state helper for layout/role display in the user table
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  const loadReviewsForBook = useCallback((bookId: string) => {
    reviewService.listByBook(bookId).then(bookReviews => {
      setReviews(prev => {
        const otherReviews = prev.filter(r => r.bookId !== bookId);
        return [...otherReviews, ...bookReviews];
      });
    }).catch(console.error);
  }, []);

  return (
    <LibCtx.Provider value={{
      books, reviews, users, wishlist,
      toggleWishlist, isWishlisted,
      addBook, updateBook, removeBook,
      addReview, removeReview, addUser, removeUser, setUserRole,
      loadReviewsForBook,
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
