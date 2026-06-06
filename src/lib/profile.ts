import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  goal_type: "calorie" | "lose_weight";
  onboarded: boolean;
  daily_calorie_goal: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fat_goal_g: number;
  starting_weight_kg: number | null;
  target_weight_kg: number | null;
  height_cm: number | null;
  sex: string | null;
  age: number | null;
  activity_level: string | null;
  streak: number;
  last_log_date: string | null;
  measurement_cadence: "weekly" | "monthly";
};

export async function getProfile(): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data as Profile;
}