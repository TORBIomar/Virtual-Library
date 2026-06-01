import { apiClient } from "./client";
import type { Book, Review, User } from "@/lib/types";

/**
 * Service layer — each export maps 1:1 to a Spring Boot REST endpoint.
 * Currently unused (mock data drives the UI); swap callers from mock
 * stores to these once the backend is reachable.
 */

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/auth/register", { name, email, password }),
  me: () => apiClient.get<User>("/auth/me"),
};

export const bookService = {
  list: () => apiClient.get<Book[]>("/books"),
  get: (id: string) => apiClient.get<Book>(`/books/${id}`),
  create: (form: FormData) =>
    apiClient.post<Book>("/books", form, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, form: FormData) =>
    apiClient.put<Book>(`/books/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id: string) => apiClient.delete<void>(`/books/${id}`),
  download: (id: string) => apiClient.get(`/books/${id}/download`, { responseType: "blob" }),
};

export const reviewService = {
  listByBook: (bookId: string) => apiClient.get<Review[]>(`/books/${bookId}/reviews`),
  create: (bookId: string, rating: number, comment: string) =>
    apiClient.post<Review>(`/books/${bookId}/reviews`, { rating, comment }),
  remove: (id: string) => apiClient.delete<void>(`/reviews/${id}`),
};

export const userService = {
  list: () => apiClient.get<User[]>("/users"),
  setRole: (id: string, role: "READER" | "ADMIN") =>
    apiClient.patch<User>(`/users/${id}/role`, { role }),
  remove: (id: string) => apiClient.delete<void>(`/users/${id}`),
};

export const wishlistService = {
  list: () => apiClient.get<string[]>("/wishlist"),
  add: (bookId: string) => apiClient.post<void>(`/wishlist/${bookId}`),
  remove: (bookId: string) => apiClient.delete<void>(`/wishlist/${bookId}`),
};
