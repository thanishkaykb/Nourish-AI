import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  component: History,
});

function History() {
  const q = useQuery({
    queryKey: ["history", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .order("logged_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const logs = q.data ?? [];
  const groups = logs.reduce<Record<string, any[]>>((acc, l: any) => {
    const k = format(new Date(l.logged_at), "EEEE, MMM d");
    (acc[k] ||= []).push(l);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl">History</h1>
        <p className="text-muted-foreground">Every meal you've logged, grouped by day.</p>
      </header>

      {logs.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display text-3xl mb-2">No meals yet</h2>
          <p className="text-muted-foreground">Log your first meal and it will show up here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([day, items]) => {
            const cal = items.reduce((a, l) => a + Number(l.calories || 0), 0);
            return (
              <section key={day} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-2xl">{day}</h2>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{Math.round(cal)}</span> kcal · {items.length} meal{items.length === 1 ? "" : "s"}
                  </div>
                </div>
                <ul className="space-y-2">
                  {items.map((l) => (
                    <li key={l.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                      {l.image_url ? (
                        <img src={l.image_url} alt={l.name} className="h-14 w-14 rounded-xl object-cover" />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-secondary grid place-items-center">🍽️</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{l.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(l.logged_at), "p")} · P {Math.round(l.protein_g)}g · C {Math.round(l.carbs_g)}g · F {Math.round(l.fat_g)}g
                        </div>
                      </div>
                      <div className="font-display text-xl text-primary">{Math.round(l.calories)}</div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}