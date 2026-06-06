import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type FoodAnalysis = {
  name: string;
  description: string;
  serving: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: "low" | "medium" | "high";
};

export const analyzeFood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageBase64: string; mime?: string; hint?: string }) => data)
  .handler(async ({ data }): Promise<FoodAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    const mime = data.mime ?? "image/jpeg";
    const dataUrl = data.imageBase64.startsWith("data:")
      ? data.imageBase64
      : `data:${mime};base64,${data.imageBase64}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition vision expert. Look at the food photo and return realistic estimates for one typical serving. If multiple items are present, sum them. Be conservative and honest about uncertainty.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: data.hint ? `User hint: ${data.hint}` : "Analyze this meal." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_meal",
              description: "Report estimated nutrition for the photographed meal.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Short name of the meal" },
                  description: { type: "string", description: "1-2 sentence breakdown of what's on the plate" },
                  serving: { type: "string", description: "Approximate serving size, e.g. '1 plate (~350g)'" },
                  calories: { type: "number" },
                  protein_g: { type: "number" },
                  carbs_g: { type: "number" },
                  fat_g: { type: "number" },
                  confidence: { type: "string", enum: ["low", "medium", "high"] },
                },
                required: ["name", "description", "serving", "calories", "protein_g", "carbs_g", "fat_g", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_meal" } },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) throw new Error("Rate limit hit — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits to keep going.");
      throw new Error(`AI error ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI returned no analysis");
    const parsed = JSON.parse(call.function.arguments) as FoodAnalysis;
    return parsed;
  });
