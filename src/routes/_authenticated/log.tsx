import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { analyzeFood } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/log")({
  component: LogMeal,
});

type Analysis = {
  name: string; description: string; serving: string;
  calories: number; protein_g: number; carbs_g: number; fat_g: number;
  confidence: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });
}

function LogMeal() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeFood);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function pickFile(f: File) {
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  }

  async function runAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    try {
      const b64 = await fileToBase64(file);
      const out = await analyze({ data: { imageBase64: b64, mime: file.type, hint } });
      setResult(out);
    } catch (e: any) {
      toast.error(e.message ?? "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      let imageUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("food-photos").upload(path, file);
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage.from("food-photos").createSignedUrl(path, 60 * 60 * 24 * 365);
        imageUrl = signed?.signedUrl ?? null;
      }
      const { error } = await supabase.from("food_logs").insert({
        user_id: user.id,
        name: result.name,
        description: result.description,
        calories: result.calories,
        protein_g: result.protein_g,
        carbs_g: result.carbs_g,
        fat_g: result.fat_g,
        serving: result.serving,
        image_url: imageUrl,
      });
      if (error) throw error;

      // Update streak
      const today = new Date().toISOString().slice(0, 10);
      const { data: prof } = await supabase.from("profiles").select("streak,last_log_date").eq("id", user.id).single();
      if (prof) {
        let newStreak = prof.streak;
        if (prof.last_log_date !== today) {
          const yest = new Date(); yest.setDate(yest.getDate() - 1);
          const yStr = yest.toISOString().slice(0, 10);
          newStreak = prof.last_log_date === yStr ? prof.streak + 1 : 1;
        }
        await supabase.from("profiles").update({ streak: newStreak, last_log_date: today }).eq("id", user.id);
      }

      toast.success("Meal logged!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-5xl">Log a meal</h1>
        <p className="text-muted-foreground">Snap your plate. AI does the math.</p>
      </header>

      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) pickFile(f);
          }}
          className={`glass-card rounded-3xl p-10 text-center transition-all ${dragOver ? "ring-2 ring-primary scale-[1.01]" : ""}`}
        >
          <div className="h-20 w-20 rounded-2xl bg-primary/15 text-primary grid place-items-center mx-auto mb-6">
            <Camera className="h-10 w-10" />
          </div>
          <h3 className="font-display text-2xl mb-2">Snap, upload, or drop a photo</h3>
          <p className="text-sm text-muted-foreground mb-6">Drag &amp; drop a picture here, take one with your camera, or browse files.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => cameraRef.current?.click()} className="gap-2 mint-glow"><Camera className="h-4 w-4" /> Take photo</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" /> Upload file</Button>
            <input
              ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
            />
            <input
              ref={fileRef} type="file" accept="image/*" hidden
              onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
            />
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden glass-card">
            <img src={preview} alt="Meal" className="w-full max-h-96 object-cover" />
            <button onClick={() => { setPreview(null); setFile(null); setResult(null); }}
              className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-background/80 backdrop-blur">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!result && (
            <div className="space-y-3">
              <Label htmlFor="hint">Hint for AI (optional)</Label>
              <Input id="hint" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="e.g. medium portion, no sauce" />
              <Button onClick={runAnalyze} disabled={analyzing} className="w-full mint-glow gap-2">
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? "Analyzing…" : "Analyze with AI"}
              </Button>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary">{result.confidence} confidence</div>
                  <h3 className="font-display text-3xl">{result.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Serving: {result.serving}</p>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <Stat label="Calories" value={result.calories} unit="" onChange={(v) => setResult({ ...result, calories: v })} big />
                  <Stat label="Protein" value={result.protein_g} unit="g" onChange={(v) => setResult({ ...result, protein_g: v })} />
                  <Stat label="Carbs" value={result.carbs_g} unit="g" onChange={(v) => setResult({ ...result, carbs_g: v })} />
                  <Stat label="Fat" value={result.fat_g} unit="g" onChange={(v) => setResult({ ...result, fat_g: v })} />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setResult(null)} className="flex-1">Redo</Button>
                  <Button onClick={save} disabled={saving} className="flex-1 mint-glow">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save to diary"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function Stat({ label, value, unit, onChange, big = false }: {
  label: string; value: number; unit: string; onChange: (v: number) => void; big?: boolean;
}) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <input type="number" value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full bg-transparent text-center font-display ${big ? "text-3xl text-primary" : "text-2xl"} focus:outline-none`} />
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}{unit && ` (${unit})`}</div>
    </div>
  );
}