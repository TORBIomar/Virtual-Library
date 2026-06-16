import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Field } from "./login";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr("Enter your name");
    if (!email.includes("@")) return setErr("Invalid email");
    if (password.length < 6) return setErr("Password must be ≥ 6 chars");
    setLoading(true);
    try {
      await register(name, email, password, "READER");
      router.navigate({ to: "/library" });
    } catch {
      setErr("Registration failed. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aurora noise-overlay grid place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/12 to-white/[0.03] grid place-items-center border border-white/[0.08]">
            <BookOpen className="w-5 h-5 text-white/80" />
          </div>
          <span className="font-display font-semibold text-xl">
            Smart<span className="text-gradient">Library</span>
          </span>
        </Link>

        <div className="glass-strong rounded-2xl p-8 animate-fade-in-scale">
          <h1 className="font-display text-2xl font-semibold mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-7">Join as a reader and start your journey.</p>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<User className="w-4 h-4" />} label="Full name" type="text" value={name} onChange={setName} />
            <Field icon={<Mail className="w-4 h-4" />} label="Email" type="email" value={email} onChange={setEmail} />
            <Field icon={<Lock className="w-4 h-4" />} label="Password" type="password" value={password} onChange={setPassword} />

            {err && <p className="text-xs text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-shine relative w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-glow disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Creating account…" : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            Already have one? <Link to="/login" className="text-white/80 hover:text-white hover:underline transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
