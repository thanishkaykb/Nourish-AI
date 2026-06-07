import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  component: History,
});

function History() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl">History</h1>
        <p className="text-muted-foreground">Your long-term trends will live here.</p>
      </header>

      <div className="glass-card rounded-3xl p-16 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 grid place-items-center mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display text-3xl mb-2">Coming soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're saving this space for richer insights — weekly recaps, macro trends, and
          personalized suggestions. Keep logging meals and check back soon.
        </p>
      </div>
    </div>
  );
}