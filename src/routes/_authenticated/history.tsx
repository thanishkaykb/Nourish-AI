import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, subDays } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { useQuery as useQ } from "@tanstack/react-query";
import { getProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/history")({
  component: History,
});

function History() {
  const profile = useQ({ queryKey: ["profile"], queryFn: getProfile });
  const since = startOfDay(subDays(new Date(), 13));
  const q = useQuery({
    queryKey: ["logs", "14d"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs").select("calories,protein_g,carbs_g,fat_g,logged_at")
        .gte("logged_at", since.toISOString())
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const days: Record<string, { date: string; cal: number; p: number; c: number; f: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "MMM d");
    days[d] = { date: d, cal: 0, p: 0, c: 0, f: 0 };
  }
  (q.data ?? []).forEach((l: any) => {
    const d = format(new Date(l.logged_at), "MMM d");
    if (days[d]) {
      days[d].cal += Number(l.calories || 0);
      days[d].p += Number(l.protein_g || 0);
      days[d].c += Number(l.carbs_g || 0);
      days[d].f += Number(l.fat_g || 0);
    }
  });
  const series = Object.values(days);
  const goal = profile.data?.daily_calorie_goal ?? 2000;
  const avg = Math.round(series.reduce((a, d) => a + d.cal, 0) / Math.max(1, series.filter(d => d.cal > 0).length || 1));
  const hit = series.filter(d => d.cal > 0 && Math.abs(d.cal - goal) <= goal * 0.1).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl">History</h1>
        <p className="text-muted-foreground">Last 14 days at a glance.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat title="Avg daily calories" value={`${avg}`} sub="kcal" />
        <Stat title="Days near goal" value={`${hit}`} sub="of 14" />
        <Stat title="Daily target" value={`${goal}`} sub="kcal" />
      </div>

      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-display text-2xl mb-4">Calories per day</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <ReferenceLine y={goal} stroke="var(--color-primary)" strokeDasharray="4 4" />
              <Bar dataKey="cal" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-display text-2xl mb-4">Macros per day (g)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Bar dataKey="p" stackId="m" fill="var(--color-protein)" name="Protein" />
              <Bar dataKey="c" stackId="m" fill="var(--color-carbs)" name="Carbs" />
              <Bar dataKey="f" stackId="m" fill="var(--color-fat)" name="Fat" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="mt-1 font-display text-4xl text-primary">{value} <span className="text-base text-muted-foreground">{sub}</span></div>
    </div>
  );
}