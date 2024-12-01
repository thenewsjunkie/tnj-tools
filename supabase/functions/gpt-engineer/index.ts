import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const githubToken = Deno.env.get('GITHUB_TOKEN');
const repoOwner = Deno.env.get('GITHUB_REPO_OWNER');
const repoName = Deno.env.get('GITHUB_REPO_NAME');

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
    console.log('Processing request...');
    const { targetPage, prompt, implement } = await req.json();
    console.log('Request params:', { targetPage, prompt, implement });

    // Get suggestions from OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes code changes and provides suggestions.'
          },
          {
            role: 'user',
            content: `Analyze the following change request for ${targetPage}: ${prompt}`
          }
        ],
      }),
    });

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response:', openAIData);

    const suggestions = openAIData.choices[0].message.content;

    if (!implement) {
      return new Response(
        JSON.stringify({ success: true, suggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new branch
    const timestamp = new Date().getTime();
    const safeBranchName = `feature/${prompt.slice(0, 50).replace(/[^a-z0-9]/gi, '-')}-${timestamp}`;
    
    // Get the default branch
    const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
      },
    });
    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;

    // Get the SHA of the default branch
    const refResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${defaultBranch}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
      },
    });
    const refData = await refResponse.json();
    const sha = refData.object.sha;

    // Create new branch
    await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${safeBranchName}`,
        sha: sha
      })
    });

    // For now, return mock implementation data
    const implementations = [
      {
        filename: `${targetPage}.tsx`,
        code: '// Example implementation\nconsole.log("Hello World");',
        implementation_id: crypto.randomUUID()
      }
    ];

    // Create commit
    const commitMessage = `feat: ${prompt.slice(0, 50)}`;
    const createCommitResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        tree: sha,
        parents: [sha]
      })
    });

    const commitData = await createCommitResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        implementations,
        commitInfo: {
          hash: commitData.sha,
          message: commitMessage,
          branch: safeBranchName
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gpt-engineer function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});