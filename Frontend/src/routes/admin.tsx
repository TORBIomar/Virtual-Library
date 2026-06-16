import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { Dropzone } from "@/components/Dropzone";
import { CATEGORIES } from "@/lib/mockData";
import {
  Shield, Trash2, Plus, BookOpen, Users, MessageSquare,
  Sparkles, Key, Brain, Thermometer, Check, Loader2, AlertCircle,
} from "lucide-react";
import { aiSettingsService, type AiSettings } from "@/lib/api/services";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Tab = "books" | "users" | "reviews" | "ai";

function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("books");

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-aurora noise-overlay">
        <Navbar />
        <div className="max-w-md mx-auto mt-32 text-center glass-strong rounded-2xl p-10 animate-fade-in-scale">
          <Shield className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="font-display text-xl font-semibold mb-2">Supervisor access only</h2>
          <p className="text-sm text-muted-foreground mb-5">Sign in as an admin to access this dashboard.</p>
          <Link to="/login" className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium inline-block hover:bg-primary/90 transition-colors">Sign in</Link>
          <p className="text-xs text-muted-foreground mt-4">Hint: <code className="text-white/60 bg-white/5 px-1.5 py-0.5 rounded">admin@smartlib.dev</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora noise-overlay">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <header className="mb-10 animate-fade-in">
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">Supervisor</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mt-2">
            Admin <span className="text-gradient">dashboard</span>
          </h1>
        </header>

        <div className="flex gap-1 glass-strong rounded-xl p-1 mb-8 w-fit">
          {([
            { k: "books" as Tab, l: "Books", i: <BookOpen className="w-4 h-4" /> },
            { k: "users" as Tab, l: "Users", i: <Users className="w-4 h-4" /> },
            { k: "reviews" as Tab, l: "Reviews", i: <MessageSquare className="w-4 h-4" /> },
            { k: "ai" as Tab, l: "AI Settings", i: <Sparkles className="w-4 h-4" /> },
          ]).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
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
        {tab === "ai" && <AiSettingsTab />}
      </div>
    </div>
  );
}

/* ========================= AI SETTINGS TAB ========================= */

function AiSettingsTab() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState(0.7);

  useEffect(() => {
    aiSettingsService.get()
      .then((s) => {
        setSettings(s);
        setModel(s.model);
        setTemperature(s.temperature);
      })
      .catch(() => setError("Failed to load AI settings"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload: { apiKey?: string; model?: string; temperature?: number } = {};
      if (apiKey.trim()) payload.apiKey = apiKey.trim();
      if (model.trim()) payload.model = model.trim();
      payload.temperature = temperature;

      const updated = await aiSettingsService.update(payload);
      setSettings(updated);
      setModel(updated.model);
      setTemperature(updated.temperature);
      setApiKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const MODELS = [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fastest, great for chat" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Most capable, best quality" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "Previous gen, fast" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", desc: "Lightweight, cost-effective" },
  ];

  if (loading) {
    return (
      <div className="glass-strong rounded-2xl p-12 text-center animate-fade-in">
        <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading AI settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-strong rounded-2xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] grid place-items-center border border-white/[0.06] shrink-0">
          <Brain className="w-6 h-6 text-white/70" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg mb-1">AI Configuration</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure the Gemini API key and model used by the AI reading companion. Changes take effect immediately for new chat sessions.
          </p>
        </div>
      </div>

      {/* Settings form */}
      <div className="glass-strong rounded-2xl p-6 space-y-6">
        {/* API Key */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-white/50" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">API Key</span>
          </div>
          {settings && (
            <div className="mb-2 text-xs text-muted-foreground">
              Current: <code className="text-white/60 bg-white/5 px-1.5 py-0.5 rounded font-mono">{settings.apiKeyMasked}</code>
            </div>
          )}
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter new API key (leave blank to keep current)"
            className="w-full bg-input rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 border border-transparent focus:border-white/10 transition-all font-mono"
          />
        </div>

        {/* Model Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-white/50" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Model</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {MODELS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setModel(m.value)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  model === m.value
                    ? "bg-white/8 border-white/15 shadow-[0_0_20px_-5px_oklch(0.8_0_0_/_0.1)]"
                    : "bg-surface/50 border-border/30 hover:border-white/10 hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{m.label}</span>
                  {model === m.value && (
                    <div className="w-5 h-5 rounded-full bg-white/90 grid place-items-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Temperature */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-white/50" />
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Temperature</span>
            </div>
            <span className="text-sm font-mono text-white/60">{temperature.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-muted-foreground">Precise</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="flex-1 accent-white/70 h-1 cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground">Creative</span>
          </div>
        </div>

        {/* Current status */}
        {settings && (
          <div className="rounded-xl bg-surface/50 border border-border/20 p-4">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium block mb-2">Current Configuration</span>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Model</div>
                <div className="font-mono text-white/80 text-xs">{settings.model}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Temperature</div>
                <div className="font-mono text-white/80 text-xs">{settings.temperature}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Embedding</div>
                <div className="font-mono text-white/80 text-xs">{settings.embeddingModel}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className={`btn-shine relative w-full py-3 rounded-xl font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer ${
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow disabled:opacity-60"
          }`}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="w-4 h-4" /> Settings saved</>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
}

/* ========================= BOOKS TAB ========================= */

function BooksTab() {
  const { books, addBook, removeBook } = useLibrary();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", category: "Fiction", description: "", year: 2024, cover: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFile) {
      alert("Please upload a PDF/ePub/TXT book file.");
      return;
    }
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("year", String(form.year));
    formData.append("file", bookFile);
    if (coverFile) {
      formData.append("cover", coverFile);
    }

    try {
      await addBook(formData);
      setForm({ title: "", author: "", category: "Fiction", description: "", year: 2024, cover: "" });
      setCoverFile(null); setBookFile(null); setOpen(false);
    } catch (err: any) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{books.length} books in the catalog</p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-shine relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-glow cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {open ? "Cancel" : "Add book"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="glass-strong rounded-2xl p-6 grid md:grid-cols-2 gap-5 animate-fade-in">
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <Input label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Year" type="number" value={String(form.year)} onChange={(v) => setForm({ ...form, year: Number(v) })} />
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full bg-input rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 border border-transparent focus:border-white/10"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="mt-1.5 w-full bg-input rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 resize-none border border-transparent focus:border-white/10"
              />
            </label>
          </div>
          <div className="space-y-4">
            <Dropzone label="Cover image" accept="image/*" onFile={setCoverFile} />
            <Dropzone label="Book file (PDF / EPUB / TXT)" accept=".pdf,.epub,.txt" onFile={setBookFile} />
            <button type="submit" className="btn-shine relative w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-glow cursor-pointer">
              Publish to library
            </button>
          </div>
        </form>
      )}

      <div className="glass-strong rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            <tr className="border-b border-border/30">
              <th className="text-left px-5 py-3">Title</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">Author</th>
              <th className="text-left px-5 py-3 hidden sm:table-cell">Category</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} className="border-b border-border/20 hover:bg-surface/50 transition-colors">
                <td className="px-5 py-3 font-medium">{b.title}</td>
                <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{b.author}</td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-surface border border-border/20">{b.category}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => removeBook(b.id)}
                    className="text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors cursor-pointer"
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

/* ========================= USERS TAB ========================= */

function UsersTab() {
  const { users, removeUser, setUserRole } = useLibrary();
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
          <tr className="border-b border-border/30">
            <th className="text-left px-5 py-3">Name</th>
            <th className="text-left px-5 py-3 hidden sm:table-cell">Email</th>
            <th className="text-left px-5 py-3">Role</th>
            <th className="text-left px-5 py-3 hidden md:table-cell">Joined</th>
            <th className="text-right px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border/20 hover:bg-surface/50 transition-colors">
              <td className="px-5 py-3 font-medium">{u.name}</td>
              <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
              <td className="px-5 py-3">
                <select
                  value={u.role}
                  onChange={(e) => setUserRole(u.id, e.target.value as "READER" | "ADMIN")}
                  className="bg-input rounded-md px-2 py-1 text-xs border border-border/20 cursor-pointer"
                >
                  <option value="READER">READER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{u.createdAt}</td>
              <td className="px-5 py-3 text-right">
                <button onClick={() => removeUser(u.id)} className="text-destructive hover:bg-destructive/10 rounded-md p-1.5 cursor-pointer">
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

/* ========================= REVIEWS TAB ========================= */

function ReviewsTab() {
  const { reviews, books, removeReview } = useLibrary();
  return (
    <div className="space-y-3">
      {reviews.length === 0 && (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No reviews to moderate.</p>
        </div>
      )}
      {reviews.map((r) => {
        const book = books.find((b) => b.id === r.bookId);
        return (
          <div key={r.id} className="glass-strong rounded-xl p-5 flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{r.userName}</span> · {book?.title ?? "Unknown"} · {r.createdAt} · {r.rating}★
              </div>
              <p className="text-sm text-white/80">{r.comment}</p>
            </div>
            <button onClick={() => removeReview(r.id)} className="text-destructive hover:bg-destructive/10 rounded-md p-1.5 shrink-0 cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ========================= SHARED INPUT ========================= */

function Input({ label, value, onChange, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-input rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 border border-transparent focus:border-white/10 transition-all"
      />
    </label>
  );
}
