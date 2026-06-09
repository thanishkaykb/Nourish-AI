import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Flame, Camera, Sparkles, LineChart, Zap, ShieldCheck, Brain, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "@/components/back-button";

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center mint-glow">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl">Nourish AI</span>
          </div>
          <BackButton />
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button size="sm" className="mint-glow">Sign up</Button></Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-12 text-center">
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
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/auth">
              <Button size="lg" className="mint-glow gap-2">
                Create free account <Camera className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">I already have one</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* What is Nourish AI */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs text-muted-foreground mb-4">
          What is Nourish AI?
        </div>
        <h2 className="font-display text-3xl md:text-4xl mb-4">
          A calorie tracker that <em className="text-primary not-italic">does the boring part for you</em>.
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          No more searching food databases or guessing portion sizes. Take a photo of your meal and
          Nourish AI identifies the dish, estimates the serving, and breaks down calories, protein,
          carbs, and fat. Log your body measurements weekly and watch a real chart tell you whether
          your diet is actually working — not just whether you're motivated.
        </p>
      </section>

      {/* Fact / stat boxes */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { stat: "<10s", label: "to log a meal", icon: Zap },
            { stat: "4", label: "macros tracked", icon: Activity },
            { stat: "100%", label: "powered by AI vision", icon: Brain },
            { stat: "0$", label: "to get started", icon: ShieldCheck },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="glass-card rounded-2xl p-5 text-center">
              <div className="h-9 w-9 mx-auto rounded-lg bg-primary/15 text-primary grid place-items-center mb-3">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="font-display text-4xl text-primary">{s.stat}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-4 text-left">
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

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-4xl md:text-5xl mb-4">Ready to actually see progress?</h2>
        <p className="text-muted-foreground mb-8">Create an account in seconds — your data, your streak, your body, all in one place.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/auth"><Button size="lg" className="mint-glow gap-2">Sign up free <Camera className="h-4 w-4" /></Button></Link>
          <Link to="/auth"><Button size="lg" variant="ghost">Sign in</Button></Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Built with care. Powered by AI.
      </footer>
    </div>
  );
}
