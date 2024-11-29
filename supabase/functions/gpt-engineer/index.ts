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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const systemPrompt = implement 
      ? `You are a React developer assistant that can directly modify the codebase. Analyze and implement the following changes to the ${targetPage} page.
         Your response must be structured exactly as follows:
         1. First, provide a brief analysis of the changes needed
         2. Then, for each file that needs to be modified, provide the complete file contents in a code block starting with \`\`\`filename
         Make sure to:
         - Include the full path of each file relative to the src directory
         - Only include files that actually need changes
         - Write the complete file contents for each modified file
         - Use // ... keep existing code for large unchanged sections
         - Follow React and TypeScript best practices
         - Use Tailwind CSS for styling
         - Leverage shadcn/ui components when possible`
      : `You are a React developer assistant. Analyze the following request for changes to the ${targetPage} page and provide detailed suggestions for implementation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    let suggestions = content;
    let implementations = [];

    if (implement) {
      const codeBlockRegex = /```(.*?)\n([\s\S]*?)```/g;
      let match;
      
      suggestions = content.split(/```.*?\n/)[0].trim();
      
      while ((match = codeBlockRegex.exec(content)) !== null) {
        const filename = match[1].trim();
        const code = match[2].trim();
        
        if (filename && code) {
          // Store the implementation in Supabase
          const { data: implData, error: implError } = await supabase
            .from('code_implementations')
            .insert({
              filename,
              code,
              target_page: targetPage,
              prompt,
              status: 'pending'
            })
            .select()
            .single();

          if (implError) throw implError;

          implementations.push({
            filename,
            code,
            implementation_id: implData.id
          });
        }
      }
    }

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