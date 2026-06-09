import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Camera, BarChart3, Ruler, LogOut, Flame, Settings, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackButton } from "@/components/back-button";
import { useState } from "react";

const nav = [
  { to: "/dashboard", label: "Today", icon: Home },
  { to: "/log", label: "Log meal", icon: Camera },
  { to: "/history", label: "History", icon: BarChart3 },
  { to: "/measurements", label: "Body", icon: Ruler },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(true);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className={`min-h-screen ${open ? "pb-24 md:pb-0 md:pl-64" : ""}`}>
      {/* Floating hamburger — always visible */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Hide menu" : "Show menu"}
        className="fixed top-3 left-3 z-50 h-10 w-10 grid place-items-center rounded-xl glass-card border border-border hover:bg-secondary transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      {open && (
      <aside className="fixed inset-y-0 left-0 hidden md:flex flex-col w-64 border-r border-border glass-card p-6 pt-16 z-40">
        <Link to="/dashboard" className="flex items-center gap-2 mb-10">
          <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center mint-glow">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl">Nourish AI</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => {
            const active = loc.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={signOut} className="justify-start gap-3 text-muted-foreground flex-1">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
          <ThemeToggle />
        </div>
      </aside>
      )}

      <main className="p-4 md:p-10 max-w-6xl mx-auto pt-16">
        <div className="mb-4 flex items-center justify-between gap-2">
          <BackButton fallback="/dashboard" />
          <div className="md:hidden"><ThemeToggle /></div>
        </div>
        {children}
      </main>

      {/* Mobile bottom nav */}
      {open && (
      <motion.nav
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-card border-t border-border px-2 py-2 grid grid-cols-5 gap-1"
      >
        {nav.map((n) => {
          const active = loc.pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          );
        })}
      </motion.nav>
      )}
    </div>
  );
}