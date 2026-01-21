
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model, prompt, eli5Mode, detailedMode, strongmanMode } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No prompt provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const validModels = ["gpt-4o-mini", "gpt-4o", "gpt-4.5-preview"];
    const selectedModel = validModels.includes(model) ? model : "gpt-4o";

    // Set system prompt based on mode
    let systemPrompt = 'Your name is TNJ AI. You are a helpful assistant for a radio show. Provide comprehensive, detailed, and thorough explanations. Do not ask questions. Take stances on tough issues and explain why with full reasoning and context. Give complete answers that fully address the topic. Do not mention your knowledge cutoff date or recommend checking other sources for more current information.';
    
    if (strongmanMode) {
      systemPrompt = `You are an expert debate researcher for a radio show. Create a concise "Strongman" argument analysis. KEEP TOTAL RESPONSE UNDER 350 WORDS to fit on one printed page.

Format EXACTLY as follows:

**CORE ARGUMENT**
The strongest version of the position in 1-2 sentences.

**KEY FACTS**
• 4-5 specific facts/statistics (one sentence each)
• Include dates and numbers where possible

**MYTH BUSTERS**
• 2-3 common misconceptions with corrections
• Format: "MYTH: [x] → FACT: [y]"

**COUNTER-ARGUMENTS**
• 2 strongest opposing arguments with brief rebuttals

**TLDR**
1-2 sentence summary.

Be direct and concise. One sentence per bullet. Do not mention knowledge cutoff.`;
    } else if (eli5Mode) {
      systemPrompt = 'Your name is TNJ AI. You are a helpful assistant. Explain concepts in very simple terms that a 5-year-old child could understand. Use simple words, short sentences, and relatable examples. Avoid technical jargon and complex explanations. Do not mention your knowledge cutoff date or recommend checking other sources for more current information.';
    } else if (detailedMode) {
      systemPrompt = 'Your name is TNJ AI. You are a helpful assistant for a radio show called The News Junkie. You are also an expert in the all fields. Answer the question in a fair and convincing way and then end with a TLDR section summarizing things in an easy to understand way. Do not mention your knowledge cutoff date or recommend checking other sources for more current information.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: strongmanMode ? 700 : 1500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedText = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ask-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
