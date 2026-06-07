import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/measurements")({
  component: Measurements,
});

function Measurements() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const list = useQuery({
    queryKey: ["measurements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("measurements").select("*").order("recorded_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const [w, setW] = useState("");
  const [bf, setBf] = useState("");
  const [waist, setWaist] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!w) { toast.error("Weight is required"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("measurements").insert({
        user_id: user.id,
        weight_kg: Number(w),
        body_fat_pct: bf ? Number(bf) : null,
        waist_cm: waist ? Number(waist) : null,
        notes: notes || null,
      });
      if (error) throw error;
      setW(""); setBf(""); setWaist(""); setNotes("");
      toast.success("Recorded!");
      qc.invalidateQueries({ queryKey: ["measurements"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSaving(false); }
  }

  const p = profile.data;
  const data = (list.data ?? []).map((m: any) => ({
    date: format(new Date(m.recorded_at), "MMM d"),
    weight: m.weight_kg ? Number(m.weight_kg) : null,
    bf: m.body_fat_pct ? Number(m.body_fat_pct) : null,
    waist: m.waist_cm ? Number(m.waist_cm) : null,
  }));

  const start = p?.starting_weight_kg ?? data[0]?.weight ?? null;
  const latest = data[data.length - 1]?.weight ?? null;
  const delta = start != null && latest != null ? +(latest - start).toFixed(1) : null;
  const target = p?.target_weight_kg;

  const working =
    delta == null ? "unknown" :
    p?.goal_type === "lose_weight" ? (delta < 0 ? "yes" : delta === 0 ? "flat" : "no") :
    "neutral";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl">Body progress</h1>
        <p className="text-muted-foreground">Log your weight whenever you want — weekly or monthly works best. We'll plot the trend so you can see if your diet is working.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Starting" value={start != null ? `${start} kg` : "—"} />
        <Stat label="Latest" value={latest != null ? `${latest} kg` : "—"} />
        <Stat label="Change"
          value={delta != null ? `${delta > 0 ? "+" : ""}${delta} kg` : "—"}
          color={delta == null ? "" : delta < 0 ? "text-primary" : delta > 0 ? "text-[var(--color-fat)]" : ""}
        />
      </div>

      {(p?.goal_type === "lose_weight" || (target != null)) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`glass-card rounded-2xl p-5 flex items-center gap-4 ${
          working === "yes" ? "border-primary/40 mint-glow" : ""
        }`}>
          {working === "yes" && <TrendingDown className="h-8 w-8 text-primary" />}
          {working === "no" && <TrendingUp className="h-8 w-8 text-[var(--color-fat)]" />}
          {working === "flat" && <Minus className="h-8 w-8 text-muted-foreground" />}
          {working === "unknown" && <Minus className="h-8 w-8 text-muted-foreground" />}
          <div>
            <div className="font-display text-2xl">
              {working === "yes" && "Your diet is working."}
              {working === "no" && "Not trending down yet."}
              {working === "flat" && "Holding steady."}
              {working === "unknown" && "Log a measurement to start."}
            </div>
            <p className="text-sm text-muted-foreground">
              {working === "yes" && "Keep going. Consistency beats intensity."}
              {working === "no" && "Consider a smaller portion or one fewer snack a day."}
              {working === "flat" && "Two more weeks of data will tell us more."}
            </p>
          </div>
        </motion.div>
      )}

      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-display text-2xl mb-4">Weight over time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              {target && <ReferenceLine y={target} label={{ value: "Target", fill: "var(--color-primary)", fontSize: 11 }} stroke="var(--color-primary)" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-display text-2xl mb-4">New check-in</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Weight (kg)" v={w} setV={setW} required />
          <Field label="Body fat %" v={bf} setV={setBf} />
          <Field label="Waist (cm)" v={waist} setV={setWaist} />
        </div>
        <div className="mt-3">
          <Label htmlFor="n">Notes</Label>
          <Input id="n" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How are you feeling?" />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={add} disabled={saving} className="mint-glow">
            {saving ? "Saving…" : "Record check-in"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = "" }: { label: string; value: string; color?: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-4xl ${color || "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Field({ label, v, setV, required = false }: { label: string; v: string; setV: (s: string) => void; required?: boolean }) {
  return (
    <div>
      <Label>{label}{required && " *"}</Label>
      <Input type="number" value={v} onChange={(e) => setV(e.target.value)} />
    </div>
  );
}