import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyAccount } from "@/lib/account.functions";
import { getProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, KeyRound, Mail, User } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const deleteAcct = useServerFn(deleteMyAccount);
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profileQ.data) {
      setName(profileQ.data.display_name ?? "");
      setCurrentEmail(profileQ.data.email ?? "");
      setEmail(profileQ.data.email ?? "");
    }
  }, [profileQ.data]);

  async function saveName() {
    if (!name.trim()) { toast.error("Name can't be empty"); return; }
    setSavingName(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingName(false); return; }
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", user.id);
    setSavingName(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Name updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function changeEmail() {
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    if (email === currentEmail) { toast.error("That's already your email"); return; }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/dashboard` },
    );
    setSavingEmail(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Check both your old and new inbox to confirm the change.");
  }

  async function sendReset() {
    if (!currentEmail) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(currentEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password reset email sent.");
  }

  async function changePw() {
    if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (pw !== pw2) { toast.error("Passwords don't match"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) { toast.error(error.message); return; }
    setPw(""); setPw2("");
    toast.success("Password changed");
  }

  async function doDelete() {
    setDeleting(true);
    try {
      await deleteAcct({});
      await supabase.auth.signOut();
      qc.clear();
      toast.success("Account deleted");
      navigate({ to: "/auth", replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="font-display text-5xl">Settings</h1>
        <p className="text-muted-foreground">Your profile, email, and security.</p>
      </header>

      <Section icon={<User className="h-4 w-4" />} title="Your name">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={saveName} disabled={savingName} className="mint-glow">
            {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save name"}
          </Button>
        </div>
      </Section>

      <Section icon={<Mail className="h-4 w-4" />} title="Email address">
        <p className="text-xs text-muted-foreground">Current: {currentEmail}</p>
        <Label htmlFor="email">New email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <p className="text-xs text-muted-foreground">We'll send a confirmation link to both your old and new email.</p>
        <div className="flex justify-end">
          <Button onClick={changeEmail} disabled={savingEmail} className="mint-glow">
            {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change email"}
          </Button>
        </div>
      </Section>

      <Section icon={<KeyRound className="h-4 w-4" />} title="Password">
        <Label htmlFor="pw">New password</Label>
        <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
        <Label htmlFor="pw2">Confirm new password</Label>
        <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={sendReset} disabled={sendingReset}>
            {sendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset via email"}
          </Button>
          <Button onClick={changePw} disabled={savingPw} className="mint-glow">
            {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change password"}
          </Button>
        </div>
      </Section>

      <Section icon={<Trash2 className="h-4 w-4 text-destructive" />} title="Danger zone">
        <p className="text-sm text-muted-foreground">Permanently delete your account and all of your meal logs and body measurements. This cannot be undone.</p>
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogContent className="glass-card">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove your profile, meal history, and body data. There is no undo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={doDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deleting…" : "Yes, delete forever"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
            <DeleteTrigger />
          </AlertDialog>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-3xl p-6 space-y-3">
      <h2 className="font-display text-2xl flex items-center gap-2">{icon} {title}</h2>
      {children}
    </section>
  );
}

function DeleteTrigger() {
  return (
    <AlertDialogTrigger asChild>
      <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" /> Delete account</Button>
    </AlertDialogTrigger>
  );
}