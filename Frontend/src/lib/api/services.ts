import { apiClient } from "./client";
import type { Book, Review, User, Role } from "@/lib/types";

// Backend Response types
interface BackendBook {
  id: string;
  title: string;
  author: string;
  summary: string;
  category: string;
  coverImageUrl: string;
  filePath: string;
  year: number;
}

interface BackendReview {
  id: string;
  userId: string;
  username: string;
  bookId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface BackendUser {
  id: string;
  username: string;
  role: Role;
}

interface BackendWishlistItem {
  id: string;
  userId: string;
  username: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageUrl: string;
  addedAt: string;
}

const mapBook = (b: BackendBook): Book => ({
  id: b.id,
  title: b.title,
  author: b.author,
  category: b.category,
  cover: b.coverImageUrl && b.coverImageUrl.startsWith("/")
    ? `${import.meta.env.VITE_API_BASE_URL ?? "/api"}${b.coverImageUrl.replace("/api", "")}`
    : b.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600",
  description: b.summary || "",
  year: b.year || 2024,
  pages: [
    b.summary || "No description provided.",
    "--- START OF BOOK ---",
    "This is a digital copy of the book. Read and enjoy your personalized AI reading companion experience."
  ],
  fileUrl: `/api/reader/books/${b.id}/download`,
  fileExt: b.filePath ? b.filePath.split('.').pop() : "pdf",
});

const mapReview = (r: BackendReview): Review => ({
  id: r.id,
  bookId: r.bookId,
  userId: r.userId,
  userName: r.username,
  rating: r.rating,
  comment: r.comment,
  createdAt: r.createdAt ? r.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
});

const mapUser = (u: BackendUser): User => ({
  id: u.id,
  name: u.username.split("@")[0],
  email: u.username,
  role: u.role,
  createdAt: new Date().toISOString().slice(0, 10),
});

export const authService = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ token: string; user: BackendUser }>("/auth/login", { username: email, password });
    return {
      token: res.data.token,
      user: mapUser(res.data.user),
    };
  },
  register: async (name: string, email: string, password: string, role?: string) => {
    const res = await apiClient.post<{ token: string; user: BackendUser }>("/auth/register", { username: email, password, role });
    return {
      token: res.data.token,
      user: mapUser(res.data.user),
    };
  },
};

export const bookService = {
  list: async () => {
    const res = await apiClient.get<BackendBook[]>("/reader/books");
    return res.data.map(mapBook);
  },
  get: async (id: string) => {
    const res = await apiClient.get<BackendBook>(`/reader/books/${id}`);
    const book = mapBook(res.data);
    try {
      const pagesRes = await apiClient.get<string[]>(`/reader/books/${id}/pages`);
      if (pagesRes.data && pagesRes.data.length > 0) {
        book.pages = pagesRes.data;
      }
    } catch (e) {
      console.error("Failed to fetch real book pages, falling back to summary.");
    }
    return book;
  },
  create: async (form: FormData) => {
    const res = await apiClient.post<BackendBook>("/admin/books", form, { headers: { "Content-Type": "multipart/form-data" } });
    return mapBook(res.data);
  },
  update: async (id: string, form: FormData) => {
    const res = await apiClient.put<BackendBook>(`/admin/books/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    return mapBook(res.data);
  },
  remove: async (id: string) => {
    await apiClient.delete<void>(`/admin/books/${id}`);
  },
  download: (id: string) =>
    apiClient.get(`/reader/books/${id}/download`, { responseType: "blob" }),
};

export const reviewService = {
  listByBook: async (bookId: string) => {
    const res = await apiClient.get<BackendReview[]>(`/reader/books/${bookId}/reviews`);
    return res.data.map(mapReview);
  },
  create: async (bookId: string, rating: number, comment: string) => {
    const res = await apiClient.post<BackendReview>(`/reader/books/${bookId}/reviews`, { rating, comment });
    return mapReview(res.data);
  },
  remove: async (id: string) => {
    await apiClient.delete<void>(`/admin/reviews/${id}`);
  },
};

export const userService = {
  list: async () => {
    const res = await apiClient.get<BackendUser[]>("/admin/users");
    return res.data.map(mapUser);
  },
  create: async (name: string, email: string, password: string, role: string) => {
    const res = await apiClient.post<BackendUser>("/users/register", { username: email, password, role });
    return mapUser(res.data);
  },
  remove: async (id: string) => {
    await apiClient.delete<void>(`/admin/users/${id}`);
  },
};

export const wishlistService = {
  list: async () => {
    const res = await apiClient.get<BackendWishlistItem[]>("/reader/wishlist");
    return res.data.map(x => x.bookId);
  },
  add: async (bookId: string) => {
    await apiClient.post<void>(`/reader/wishlist/${bookId}`);
  },
  remove: async (bookId: string) => {
    await apiClient.delete<void>(`/reader/wishlist/${bookId}`);
  },
};

export interface AiSettings {
  apiKeyMasked: string;
  model: string;
  temperature: number;
  embeddingModel: string;
}

export const aiSettingsService = {
  get: async () => {
    const res = await apiClient.get<AiSettings>("/admin/ai-settings");
    return res.data;
  },
  update: async (data: { apiKey?: string; model?: string; temperature?: number }) => {
    const res = await apiClient.put<AiSettings>("/admin/ai-settings", data);
    return res.data;
  },
};

export interface AiChatPayload {
  question: string;
  bookId?: string;
  chatHistory?: string[];
}

export interface AiChatResult {
  answer: string;
  sources: string[];
}

export const aiChatService = {
  chat: async (payload: AiChatPayload) => {
    const res = await apiClient.post<AiChatResult>("/ai/chat", payload);
    return res.data;
  },
};

