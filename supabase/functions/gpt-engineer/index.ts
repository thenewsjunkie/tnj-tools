import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetPage, prompt, implement = false } = await req.json();

    const systemPrompt = implement 
      ? `You are a React developer assistant. Analyze and implement the following changes to the ${targetPage} page. 
         Your response should be structured as follows:
         1. First, provide a brief analysis of the changes needed
         2. Then, for each file that needs to be modified, provide the complete file contents in a code block starting with \`\`\`filename.tsx
         Make sure to include the full path of each file relative to the src directory.
         Only include files that actually need changes.`
      : `You are a React developer assistant. Analyze the following request for changes to the ${targetPage} page and provide detailed suggestions for implementation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse implementation code if requested
    let suggestions = content;
    let implementations = [];

    if (implement) {
      // Extract code blocks with filenames
      const codeBlockRegex = /```(.*?)\n([\s\S]*?)```/g;
      let match;
      
      // Get the analysis part (everything before the first code block)
      suggestions = content.split(/```.*?\n/)[0].trim();
      
      // Extract all code blocks with their filenames
      while ((match = codeBlockRegex.exec(content)) !== null) {
        const filename = match[1].trim();
        const code = match[2].trim();
        if (filename && code) {
          implementations.push({
            filename,
            code
          });
        }
      }
    }

    console.log('GPT Engineer request:', { targetPage, prompt, implement });
    console.log('GPT Engineer response:', { suggestions, implementations });

    return new Response(
      JSON.stringify({ 
        success: true,
        suggestions,
        implementations,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in gpt-engineer function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});