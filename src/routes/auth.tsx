import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { BackButton } from "@/components/back-button";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Nourish AI" },
      { name: "description", content: "Sign in or create your Nourish AI account to start tracking calories with AI." },
    ],
  }),
  component: AuthPage,
});

const signinSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});
const signupSchema = signinSchema.extend({
  name: z.string().trim().min(1, "Please enter your name").max(80),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function forgotPassword() {
    if (!email || !email.includes("@")) { toast.error("Enter your email above first"); return; }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password reset email sent.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = mode === "signup"
      ? signupSchema.safeParse({ name, email, password })
      : signinSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const data = parsed.data as { name: string; email: string; password: string };
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: data.name },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          const msg = /invalid login/i.test(error.message)
            ? "Your email or password is incorrect."
            : /not confirmed|confirm/i.test(error.message)
            ? "Please confirm your email first — check your inbox."
            : error.message;
          throw new Error(msg);
        }
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-2xl p-8"
      >
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary grid place-items-center mint-glow">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl">Nourish AI</span>
          </div>
          <BackButton />
        </div>
        <h1 className="font-display text-4xl mb-2">
          {mode === "signin" ? "Welcome back." : "Start your journey."}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Sign in to your account." : "Create an account — verified by email."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input id="name" type="text" required autoComplete="name"
                value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <Button type="submit" disabled={loading} className="w-full mint-glow">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {mode === "signin" && (
          <button onClick={forgotPassword} disabled={resetting}
            className="mt-3 text-xs text-muted-foreground hover:text-primary underline w-full text-center">
            {resetting ? "Sending…" : "Forgot your password?"}
          </button>
        )}

        <p className="mt-6 text-sm text-muted-foreground text-center">
          {mode === "signin" ? "No account?" : "Already a member?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary hover:underline">
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}