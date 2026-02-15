
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
    const { model, prompt, eli5Mode, detailedMode, strongmanMode, rundownMode, datasheetMode, sections } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No prompt provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isSearchMode = rundownMode || strongmanMode;
    const validModels = ["gpt-4o-mini", "gpt-4o", "gpt-4.5-preview"];
    const selectedModel = isSearchMode ? "gpt-4o-search-preview" : (validModels.includes(model) ? model : "gpt-4o");

    // Set system prompt based on mode
    let systemPrompt = 'Your name is TNJ AI. You are a helpful assistant for a radio show. Provide comprehensive, detailed, and thorough explanations. Do not ask questions. Take stances on tough issues and explain why with full reasoning and context. Give complete answers that fully address the topic. Do not mention your knowledge cutoff date or recommend checking other sources for more current information.';
    
    if (datasheetMode) {
      const sectionList = (sections || []).join(", ");
      systemPrompt = `You are a research analyst for a radio show. Create a concise data briefing sheet. KEEP TOTAL RESPONSE UNDER 500 WORDS to fit on one printed page.

Only include the following sections: ${sectionList}

For each requested section, use this format:

**SECTION NAME**
• [Specific data point with dates, numbers, sources where possible]
• [Another data point - one sentence each, 3-5 per section]

Section guidelines:
- **Basic Details**: Key facts, people involved, background context, what happened and why it matters
- **Timeline**: Chronological sequence of major events with dates
- **Polling Data**: Public opinion polls, survey results, approval ratings on this topic and related issues
- **Key Players**: Who's involved, their positions, motivations, and influence
- **Legal/Regulatory**: Relevant laws, court rulings, pending legislation, regulatory actions
- **Financial Impact**: Economic data, costs, budget implications, market effects

IMPORTANT: Only include the sections listed above. Skip any section not requested. Be specific with data — use real numbers, dates, and names. Do not mention knowledge cutoff.`;
    } else if (rundownMode || strongmanMode) {
      systemPrompt = `I'm preparing a detailed breakdown on: ${prompt}

Give me a comprehensive, structured analysis in tight bullet points with clear section headers.

Be specific. Avoid vague summaries. Write at least 3-5 detailed bullet points per section. Do not summarize in one sentence what deserves a paragraph. Be thorough -- this is a full briefing document, not a quick summary.

Include specific names, dates, numbers, and direct quotes wherever possible.

Separate confirmed facts from claims, allegations, or speculation.

Include direct links to credible sources (AP, Reuters, official statements, court documents, regulatory filings, academic papers, etc.) whenever possible.

Organize the response into these sections:

1. Overview
- What this story/event is
- Why it is currently relevant
- The most important headline-level facts

2. Timeline
- Key events in chronological order
- Dates whenever available
- Major turning points

3. Key Players
- Individuals, organizations, governments, companies involved
- Their roles and stakes in the situation

4. Core Issues
- What is actually at the center of this story
- Legal, financial, scientific, ethical, or political dimensions
- What is disputed (if anything)

5. Verified Facts vs. Claims
- Clearly distinguish confirmed information from allegations or narratives
- Identify what remains unproven or unclear

6. Impact & Stakes
- Who is affected
- Financial, legal, cultural, or geopolitical consequences
- Why this matters beyond the headline

7. Reactions
- Statements from key figures
- Institutional responses
- Public or media reaction

8. What Happens Next
- Upcoming deadlines, hearings, releases, votes, matches, or expected developments
- Realistic possible outcomes

9. Unanswered Questions
- Gaps in evidence
- Inconsistencies
- What experts are still debating

End with:

3 Big Takeaways
- Clear, punchy summary bullets suitable for broadcast

Keep it structured, factual, and precise. Do not mention your knowledge cutoff date.`;
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
        max_tokens: datasheetMode ? 1000 : isSearchMode ? 10000 : 1500,
        ...(isSearchMode
          ? { web_search_options: { search_context_size: "high" } }
          : { temperature: 0.7, presence_penalty: 0.1, frequency_penalty: 0.1 }
        ),
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
