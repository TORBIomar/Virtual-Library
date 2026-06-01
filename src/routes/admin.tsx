import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { Dropzone } from "@/components/Dropzone";
import { CATEGORIES } from "@/lib/mockData";
import { Shield, Trash2, Plus, BookOpen, Users, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Tab = "books" | "users" | "reviews";

function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("books");

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-aurora">
        <Navbar />
        <div className="max-w-md mx-auto mt-32 text-center glass rounded-2xl p-10">
          <Shield className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold mb-2">Supervisor access only</h2>
          <p className="text-sm text-muted-foreground mb-5">Sign in as an admin to access this dashboard.</p>
          <Link to="/login" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium inline-block">Sign in</Link>
          <p className="text-xs text-muted-foreground mt-4">Hint: <code className="text-foreground">admin@smartlib.dev</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <header className="mb-10 animate-fade-in">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Supervisor</div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Admin <span className="text-gradient">dashboard</span>
          </h1>
        </header>

        <div className="flex gap-1 glass rounded-xl p-1 mb-8 w-fit">
          {([
            { k: "books", l: "Books", i: <BookOpen className="w-4 h-4" /> },
            { k: "users", l: "Users", i: <Users className="w-4 h-4" /> },
            { k: "reviews", l: "Reviews", i: <MessageSquare className="w-4 h-4" /> },
          ] as { k: Tab; l: string; i: React.ReactNode }[]).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                tab === t.k ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.i} {t.l}
            </button>
          ))}
        </div>

        {tab === "books" && <BooksTab />}
        {tab === "users" && <UsersTab />}
        {tab === "reviews" && <ReviewsTab />}
      </div>
    </div>
  );
}

function BooksTab() {
  const { books, addBook, removeBook } = useLibrary();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", category: "Fiction", description: "", year: 2024, cover: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const coverUrl = coverFile ? URL.createObjectURL(coverFile) : form.cover || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600";
    addBook({
      title: form.title,
      author: form.author,
      category: form.category,
      description: form.description,
      year: Number(form.year),
      cover: coverUrl,
      fileUrl: bookFile ? URL.createObjectURL(bookFile) : "#",
    });
    setForm({ title: "", author: "", category: "Fiction", description: "", year: 2024, cover: "" });
    setCoverFile(null); setBookFile(null); setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{books.length} books in the catalog</p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-shine relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-glow"
        >
          <Plus className="w-4 h-4" /> {open ? "Cancel" : "Add book"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="glass rounded-2xl p-6 grid md:grid-cols-2 gap-5 animate-fade-in">
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <Input label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Year" type="number" value={String(form.year)} onChange={(v) => setForm({ ...form, year: Number(v) })} />
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full bg-input rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="mt-1.5 w-full bg-input rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </label>
          </div>
          <div className="space-y-4">
            <Dropzone label="Cover image" accept="image/*" onFile={setCoverFile} />
            <Dropzone label="Book file (PDF / EPUB / TXT)" accept=".pdf,.epub,.txt" onFile={setBookFile} />
            <button type="submit" className="btn-shine relative w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-glow">
              Publish to library
            </button>
          </div>
        </form>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border/50">
              <th className="text-left px-5 py-3">Title</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">Author</th>
              <th className="text-left px-5 py-3 hidden sm:table-cell">Category</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} className="border-b border-border/30 hover:bg-surface/50 transition-colors">
                <td className="px-5 py-3 font-medium">{b.title}</td>
                <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{b.author}</td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface">{b.category}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => removeBook(b.id)}
                    className="text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const { users, removeUser, setUserRole } = useLibrary();
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-widest text-muted-foreground">
          <tr className="border-b border-border/50">
            <th className="text-left px-5 py-3">Name</th>
            <th className="text-left px-5 py-3 hidden sm:table-cell">Email</th>
            <th className="text-left px-5 py-3">Role</th>
            <th className="text-left px-5 py-3 hidden md:table-cell">Joined</th>
            <th className="text-right px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border/30 hover:bg-surface/50">
              <td className="px-5 py-3 font-medium">{u.name}</td>
              <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
              <td className="px-5 py-3">
                <select
                  value={u.role}
                  onChange={(e) => setUserRole(u.id, e.target.value as "READER" | "ADMIN")}
                  className="bg-input rounded-md px-2 py-1 text-xs"
                >
                  <option value="READER">READER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{u.createdAt}</td>
              <td className="px-5 py-3 text-right">
                <button onClick={() => removeUser(u.id)} className="text-destructive hover:bg-destructive/10 rounded-md p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewsTab() {
  const { reviews, books, removeReview } = useLibrary();
  return (
    <div className="space-y-3">
      {reviews.length === 0 && <p className="text-muted-foreground">No reviews to moderate.</p>}
      {reviews.map((r) => {
        const book = books.find((b) => b.id === r.bookId);
        return (
          <div key={r.id} className="glass rounded-xl p-5 flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{r.userName}</span> · {book?.title ?? "Unknown"} · {r.createdAt} · {r.rating}★
              </div>
              <p className="text-sm">{r.comment}</p>
            </div>
            <button onClick={() => removeReview(r.id)} className="text-destructive hover:bg-destructive/10 rounded-md p-1.5 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-input rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
