import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) { setErr("Enter a valid email"); return; }
    if (password.length < 3) { setErr("Password too short"); return; }
    setLoading(true);
    try {
      const u = await login(email, password);
      router.navigate({ to: u.role === "ADMIN" ? "/admin" : "/library" });
    } catch {
      setErr("Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-aurora noise-overlay grid place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/12 to-white/[0.03] grid place-items-center border border-white/[0.08]">
            <BookOpen className="w-5 h-5 text-foreground/80" />
          </div>
          <span className="font-display font-semibold text-xl">
            Smart<span className="text-gradient">Library</span>
          </span>
        </Link>

        <div className="glass-strong rounded-2xl p-8 animate-fade-in-scale">
          <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-7">Sign in to continue your reading.</p>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<Mail className="w-4 h-4" />} label="Email" type="email" value={email} onChange={setEmail} />
            <Field icon={<Lock className="w-4 h-4" />} label="Password" type="password" value={password} onChange={setPassword} />
            {err && <p className="text-xs text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-shine relative w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-glow disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-4 text-sm text-center">
            New here? <Link to="/register" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Field({ icon, label, type, value, onChange }: {
  icon: React.ReactNode; label: string; type: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{label}</span>
      <div className="mt-1.5 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full bg-input rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 transition-shadow border border-transparent focus:border-foreground/10"
        />
      </div>
    </label>
  );
}
