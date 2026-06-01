import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Bookmark, Shield, LogOut, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            Smart<span className="text-gradient">Library</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/library" icon={<BookOpen className="w-4 h-4" />} label="Library" />
          {user && <NavLink to="/wishlist" icon={<Bookmark className="w-4 h-4" />} label="Wishlist" />}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" icon={<Shield className="w-4 h-4" />} label="Admin" />
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-primary-foreground">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="leading-tight">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{user.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-surface"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-shine relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-glow"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors flex items-center gap-2"
      activeProps={{ className: "text-foreground bg-surface" }}
    >
      {icon}
      {label}
    </Link>
  );
}
