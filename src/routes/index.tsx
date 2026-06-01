import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Sparkles, BookOpen, Bookmark, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-aurora">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-widest">AI-powered reading companion</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] animate-fade-in">
          The library, <br />
          <span className="text-gradient">reimagined.</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed animate-fade-in" style={{ animationDelay: "100ms" }}>
          Discover, read, and discuss thousands of books in a distraction-free workspace —
          with Gemini as your always-on reading companion.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <Link to="/library" className="btn-shine relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-glow hover:bg-primary/90 transition-all">
            Enter the library <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="px-6 py-3 rounded-xl glass font-medium hover:bg-surface transition-colors">
            Sign in
          </Link>
        </div>

        <div className="mt-24 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { icon: <BookOpen />, t: "Virtual Reader Room", d: "Distraction-free split-screen reading with paginated viewer." },
            { icon: <Sparkles />, t: "Gemini AI Chat", d: "Ask context-aware questions about whatever you're reading." },
            { icon: <Bookmark />, t: "Read Later", d: "One-tap bookmarks sync across your sessions." },
          ].map((f, i) => (
            <div key={i} className="hover-lift glass rounded-2xl p-6 text-left animate-fade-in" style={{ animationDelay: `${300 + i * 80}ms` }}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center mb-4 text-primary-foreground">
                {f.icon}
              </div>
              <div className="font-display font-semibold mb-1">{f.t}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
