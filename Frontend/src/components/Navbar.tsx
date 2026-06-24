import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Bookmark, Shield, LogOut, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={user ? "/library" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/[0.03] flex items-center justify-center group-hover:from-foreground/15 group-hover:to-foreground/[0.05] transition-all border border-foreground/[0.06]">
            <BookOpen className="w-5 h-5 text-foreground/80" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            Smart<span className="text-gradient">Library</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {!isLandingPage && <NavLink to="/library" icon={<BookOpen className="w-4 h-4" />} label="Library" />}
          {user && <NavLink to="/wishlist" icon={<Bookmark className="w-4 h-4" />} label="Wishlist" />}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" icon={<Shield className="w-4 h-4" />} label="Admin" />
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground/15 to-foreground/[0.04] flex items-center justify-center text-xs font-semibold text-foreground/80 border border-foreground/[0.08]">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="leading-tight">
                  <div className="font-medium text-foreground/90">{user.name}</div>
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
              className="btn-shine relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-glow"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
          )}
          <ThemeToggle />
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
