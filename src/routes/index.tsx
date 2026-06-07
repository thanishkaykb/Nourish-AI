import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Flame, Camera, Sparkles, LineChart } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nourish AI — AI calorie & macro tracker" },
      { name: "description", content: "Snap a photo, get calories and macros in seconds. Track your diet, body, and streak — powered by AI." },
      { property: "og:title", content: "Nourish AI — AI calorie & macro tracker" },
      { property: "og:description", content: "Snap. Track. Transform. AI-powered calorie tracking with weekly body progress." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center mint-glow">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl">Nourish AI</span>
        </div>
        <Link to="/auth">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-28 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs text-primary mb-6">
            <Sparkles className="h-3 w-3" /> AI-powered nutrition vision
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] max-w-3xl mx-auto">
            Snap your plate.<br />
            <em className="text-primary not-italic">Know your macros.</em>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto text-lg">
            Photograph any meal — get calories, protein, carbs, and fat in seconds. Track your diet, your body, your streak.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="mint-glow gap-2">
                Start tracking free <Camera className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-24 grid md:grid-cols-3 gap-4 text-left">
          {[
            { icon: Camera, title: "Snap & analyze", body: "Point your camera at any meal. AI identifies the food and estimates calories and macros instantly." },
            { icon: Flame, title: "Daily macro rings", body: "Watch protein, carbs, and fat fill up as you eat. Goal-aware, streak-aware, calm." },
            { icon: LineChart, title: "Body progress", body: "Log weekly measurements. See a chart that tells you if your diet is actually working." },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Built with care. Powered by AI.
      </footer>
    </div>
  );
}
