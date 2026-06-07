import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/profile";
import { MacroRing } from "@/components/macro-ring";
import { Button } from "@/components/ui/button";
import { Camera, Flame, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileQ.data && !profileQ.data.onboarded) navigate({ to: "/onboarding" });
  }, [profileQ.data, navigate]);

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const logsQ = useQuery({
    queryKey: ["logs", "today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .gte("logged_at", todayStart.toISOString())
        .order("logged_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function deleteLog(id: string) {
    const { error } = await supabase.from("food_logs").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    logsQ.refetch();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("food_logs")
      .update({
        name: editing.name,
        calories: Number(editing.calories) || 0,
        protein_g: Number(editing.protein_g) || 0,
        carbs_g: Number(editing.carbs_g) || 0,
        fat_g: Number(editing.fat_g) || 0,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    setEditing(null);
    logsQ.refetch();
  }

  if (!profileQ.data) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  const p = profileQ.data;
  const logs = logsQ.data ?? [];
  const sum = logs.reduce((a, l: any) => ({
    cal: a.cal + Number(l.calories || 0),
    p: a.p + Number(l.protein_g || 0),
    c: a.c + Number(l.carbs_g || 0),
    f: a.f + Number(l.fat_g || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 });

  const remaining = Math.max(0, p.daily_calorie_goal - sum.cal);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">{format(new Date(), "EEEE, MMM d")}</p>
          <h1 className="font-display text-5xl">Hi, {p.display_name ?? "friend"}.</h1>
        </div>
        <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-sm"><strong className="text-primary">{p.streak}</strong> day streak</span>
        </div>
      </header>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Today</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-7xl text-primary">{Math.round(sum.cal)}</span>
              <span className="text-2xl text-muted-foreground">/ {p.daily_calorie_goal} kcal</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {remaining > 0 ? `${remaining} kcal remaining` : `${Math.abs(p.daily_calorie_goal - sum.cal)} kcal over`}
            </p>
            <Link to="/log" className="inline-block mt-6">
              <Button size="lg" className="mint-glow gap-2"><Camera className="h-4 w-4" /> Log a meal</Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <MacroRing value={sum.p} goal={p.protein_goal_g} label="Protein" color="var(--color-protein)" />
            <MacroRing value={sum.c} goal={p.carbs_goal_g} label="Carbs" color="var(--color-carbs)" />
            <MacroRing value={sum.f} goal={p.fat_goal_g} label="Fat" color="var(--color-fat)" />
          </div>
        </div>
      </motion.section>

      <section>
        <h2 className="font-display text-3xl mb-4">Today's meals</h2>
        {logs.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-muted-foreground mb-4">No meals logged yet today.</p>
            <Link to="/log"><Button variant="outline" className="gap-2"><Camera className="h-4 w-4" /> Snap your first meal</Button></Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {logs.map((l: any) => (
              <li key={l.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                {l.image_url ? (
                  <img src={l.image_url} alt={l.name} className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-secondary grid place-items-center text-muted-foreground">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(l.logged_at), "p")} · P {Math.round(l.protein_g)}g · C {Math.round(l.carbs_g)}g · F {Math.round(l.fat_g)}g
                  </div>
                </div>
                <div className="font-display text-2xl text-primary">{Math.round(l.calories)}</div>
                <Button size="icon" variant="ghost" onClick={() => setEditing({ ...l })}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteLog(l.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit meal</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="e-name">Name</Label>
                <Input id="e-name" value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="e-cal">Calories</Label>
                  <Input id="e-cal" type="number" value={editing.calories ?? 0}
                    onChange={(e) => setEditing({ ...editing, calories: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="e-p">Protein (g)</Label>
                  <Input id="e-p" type="number" value={editing.protein_g ?? 0}
                    onChange={(e) => setEditing({ ...editing, protein_g: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="e-c">Carbs (g)</Label>
                  <Input id="e-c" type="number" value={editing.carbs_g ?? 0}
                    onChange={(e) => setEditing({ ...editing, carbs_g: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="e-f">Fat (g)</Label>
                  <Input id="e-f" type="number" value={editing.fat_g ?? 0}
                    onChange={(e) => setEditing({ ...editing, fat_g: e.target.value })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving} className="mint-glow">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}