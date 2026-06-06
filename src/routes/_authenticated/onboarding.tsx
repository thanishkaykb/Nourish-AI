import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Scale, Activity, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function calcGoals(opts: {
  sex: string; age: number; height_cm: number; weight_kg: number; activity: string; mode: "calorie" | "lose_weight";
}) {
  // Mifflin-St Jeor
  const bmr = opts.sex === "female"
    ? 10 * opts.weight_kg + 6.25 * opts.height_cm - 5 * opts.age - 161
    : 10 * opts.weight_kg + 6.25 * opts.height_cm - 5 * opts.age + 5;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }[opts.activity] ?? 1.4;
  let cal = Math.round(bmr * mult);
  if (opts.mode === "lose_weight") cal -= 500;
  cal = Math.max(1200, cal);
  return {
    daily_calorie_goal: cal,
    protein_goal_g: Math.round((cal * 0.3) / 4),
    carbs_goal_g: Math.round((cal * 0.4) / 4),
    fat_goal_g: Math.round((cal * 0.3) / 9),
  };
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"mode" | "details">("mode");
  const [mode, setMode] = useState<"calorie" | "lose_weight" | null>(null);
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [cadence, setCadence] = useState<"weekly" | "monthly">("weekly");
  const [saving, setSaving] = useState(false);

  async function finish(skipMeasurements = false) {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const baseUpdate: any = { onboarded: true, goal_type: mode };
      if (!skipMeasurements && mode === "lose_weight") {
        const ageN = Number(age), hN = Number(height), wN = Number(weight);
        if (!ageN || !hN || !wN) { toast.error("Fill all fields"); setSaving(false); return; }
        Object.assign(baseUpdate, {
          sex, age: ageN, height_cm: hN,
          starting_weight_kg: wN,
          target_weight_kg: targetWeight ? Number(targetWeight) : null,
          activity_level: activity,
          measurement_cadence: cadence,
          ...calcGoals({ sex, age: ageN, height_cm: hN, weight_kg: wN, activity, mode: "lose_weight" }),
        });
        // also create first measurement entry
        await supabase.from("measurements").insert({ user_id: user.id, weight_kg: wN, notes: "Starting point" });
      }
      const { error } = await supabase.from("profiles").update(baseUpdate).eq("id", user.id);
      if (error) throw error;
      toast.success("You're all set!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {step === "mode" && (
          <>
            <h1 className="font-display text-5xl mb-3">What brings you here?</h1>
            <p className="text-muted-foreground mb-8">Pick what fits. You can change it later.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("calorie")}
                className={`glass-card text-left rounded-2xl p-6 transition ${mode === "calorie" ? "ring-2 ring-primary mint-glow" : ""}`}
              >
                <Activity className="h-7 w-7 text-primary mb-3" />
                <div className="font-display text-2xl mb-1">Just track calories</div>
                <p className="text-sm text-muted-foreground">Log meals, see macros, build a streak. No body measurements needed.</p>
              </button>
              <button
                onClick={() => setMode("lose_weight")}
                className={`glass-card text-left rounded-2xl p-6 transition ${mode === "lose_weight" ? "ring-2 ring-primary mint-glow" : ""}`}
              >
                <Scale className="h-7 w-7 text-primary mb-3" />
                <div className="font-display text-2xl mb-1">I want to lose weight</div>
                <p className="text-sm text-muted-foreground">We'll set goals from your body data and chart progress weekly.</p>
              </button>
            </div>
            <div className="mt-10 flex justify-end">
              <Button disabled={!mode} onClick={() => {
                if (mode === "calorie") finish(true);
                else setStep("details");
              }}>
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <h1 className="font-display text-5xl mb-3">Tell us about you.</h1>
            <p className="text-muted-foreground mb-8">We use this to compute calorie and macro targets.</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Sex</Label>
                <div className="flex gap-2 mt-2">
                  {["male", "female"].map((s) => (
                    <button key={s} onClick={() => setSex(s)}
                      className={`flex-1 rounded-lg border border-border py-2 text-sm capitalize ${sex === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="h">Height (cm)</Label>
                <Input id="h" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="w">Current weight (kg)</Label>
                <Input id="w" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tw">Target weight (kg, optional)</Label>
                <Input id="tw" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
              </div>
              <div>
                <Label>Activity level</Label>
                <select value={activity} onChange={(e) => setActivity(e.target.value)}
                  className="mt-2 w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Very active</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Check-in cadence</Label>
                <div className="flex gap-2 mt-2">
                  {(["weekly", "monthly"] as const).map((c) => (
                    <button key={c} onClick={() => setCadence(c)}
                      className={`flex-1 rounded-lg border border-border py-2 text-sm capitalize ${cadence === c ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{c}</button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">We'll remind you to log measurements so we can chart whether your diet is working.</p>
              </div>
            </div>

            <div className="mt-10 flex justify-between">
              <Button variant="ghost" onClick={() => setStep("mode")}>Back</Button>
              <Button onClick={() => finish(false)} disabled={saving} className="mint-glow">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish setup"}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}