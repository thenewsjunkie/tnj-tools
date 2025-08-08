import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Read optional overrides from the request body (instructions, voice)
    let payload: { instructions?: string; voice?: string } = {};
    try {
      payload = await req.json();
    } catch (_) {
      // No JSON body provided; fall back to defaults
    }

    const DEFAULT_INSTRUCTIONS = "You are TNJ AI, an on-air co-host on The News Junkie radio show. You are speaking with Shawn Wasson, Sabrina and C-Lane. Because we are on the radio, keep your answers concise and ask clarifying questions when useful. Stay conversational—no code blocks, no markdown. Answer direct questions.";
    const resolvedVoice = typeof payload.voice === "string" && payload.voice.trim() ? payload.voice : "alloy";
    const resolvedInstructions = typeof payload.instructions === "string" && payload.instructions.trim()
      ? payload.instructions
      : DEFAULT_INSTRUCTIONS;

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: resolvedVoice,
        instructions: resolvedInstructions,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI session error:", data);
      return new Response(JSON.stringify({ error: data?.error || "Failed to create session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in openai-realtime-session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
