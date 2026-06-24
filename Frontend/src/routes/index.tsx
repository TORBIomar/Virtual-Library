import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Sparkles, BookOpen, Bookmark, Library, Headphones, Quote } from "lucide-react";

export const Route = createFileRoute("/")(
  { component: Landing },
);

function Landing() {
  return (
    <div className="min-h-screen bg-aurora noise-overlay">
      <Navbar />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-36 text-center overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-white/[0.02] to-transparent blur-3xl animate-float" />
        <div className="absolute bottom-10 right-[10%] w-96 h-96 rounded-full bg-gradient-to-tl from-white/[0.015] to-transparent blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-10 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/70 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/60 font-medium">AI-powered reading companion</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-semibold tracking-tight leading-[1.02] animate-fade-in-scale">
            The library,<br />
            <span className="text-gradient">reimagined.</span>
          </h1>

          <p className="mt-8 max-w-lg mx-auto text-muted-foreground text-lg leading-relaxed animate-fade-in" style={{ animationDelay: "120ms" }}>
            Discover, read, and discuss thousands of books in a distraction-free workspace — with Gemini as your always-on reading companion.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: "240ms" }}>
            <Link
              to="/login"
              className="btn-shine relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium shadow-glow hover:shadow-[0_0_50px_-8px_oklch(0.85_0_0_/_0.35)] transition-all duration-500"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Separator */}
      <div className="max-w-xs mx-auto line-glow mb-20" />

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">Features</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-4 tracking-tight">
            Crafted for <span className="text-gradient">deep readers</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: <BookOpen className="w-5 h-5" />,
              title: "Virtual Reader Room",
              desc: "Distraction-free split-screen reading with paginated viewer and ambient mode.",
              delay: 0,
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              title: "Gemini AI Chat",
              desc: "Ask context-aware questions about whatever you're reading — powered by Google Gemini.",
              delay: 100,
            },
            {
              icon: <Bookmark className="w-5 h-5" />,
              title: "Read Later",
              desc: "One-tap bookmarks sync across all sessions. Pick up right where you left off.",
              delay: 200,
            },
          ].map((f, i) => (
            <div
              key={i}
              className="hover-lift glass-strong rounded-2xl p-7 text-left animate-slide-up group"
              style={{ animationDelay: `${300 + f.delay}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] grid place-items-center mb-5 text-foreground/80 group-hover:text-foreground transition-colors border border-white/[0.06]">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote band */}
      <section className="border-t border-b border-border/30 py-16 mb-20">
        <div className="max-w-3xl mx-auto px-6 text-center animate-fade-in">
          <Quote className="w-8 h-8 text-foreground/10 mx-auto mb-6" />
          <blockquote className="font-display text-xl md:text-2xl font-medium text-foreground/70 leading-relaxed italic">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </blockquote>
          <cite className="block mt-4 text-sm text-muted-foreground not-italic">— George R.R. Martin</cite>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/10 to-white/[0.03] grid place-items-center border border-white/[0.06]">
              <BookOpen className="w-3.5 h-3.5 text-foreground/70" />
            </div>
            <span className="font-display font-medium text-sm text-foreground/50">SmartLibrary</span>
          </div>
          <p className="text-foreground/30">© 2026 SmartLibrary. Crafted with care.</p>
        </div>
      </footer>
    </div>
  );
}
