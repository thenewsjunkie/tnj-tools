import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Octokit } from "https://esm.sh/@octokit/core";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const githubToken = Deno.env.get('GITHUB_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const repoOwner = Deno.env.get('GITHUB_REPO_OWNER');
const repoName = Deno.env.get('GITHUB_REPO_NAME');

const octokit = new Octokit({ auth: githubToken });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetPage, prompt, implement = false, rollback = false, commitHash, branchName } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle rollback
    if (rollback && commitHash) {
      await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: commitHash,
        force: true,
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    let commitInfo = null;

    if (implement) {
      const codeBlockRegex = /```(.*?)\n([\s\S]*?)```/g;
      let match;
      
      suggestions = content.split(/```.*?\n/)[0].trim();
      
      // Create a new branch for the changes
      const timestamp = new Date().getTime();
      const branchName = `gpt-engineer/${timestamp}`;
      const defaultBranch = 'main';

      // Get the SHA of the latest commit on the default branch
      const { data: refData } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${defaultBranch}`,
      });

      // Create a new branch
      await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      });

      while ((match = codeBlockRegex.exec(content)) !== null) {
        const filename = match[1].trim();
        const code = match[2].trim();
        
        if (filename && code) {
          // Get the current file content to get its SHA
          try {
            const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
              owner: repoOwner,
              repo: repoName,
              path: filename,
              ref: branchName,
            });

            // Update the file
            await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
              owner: repoOwner,
              repo: repoName,
              path: filename,
              message: `Update ${filename} - ${prompt}`,
              content: btoa(code),
              sha: fileData.sha,
              branch: branchName,
            });
          } catch (error) {
            if (error.status === 404) {
              // File doesn't exist, create it
              await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner: repoOwner,
                repo: repoName,
                path: filename,
                message: `Create ${filename} - ${prompt}`,
                content: btoa(code),
                branch: branchName,
              });
            } else {
              throw error;
            }
          }

          implementations.push({
            filename,
            code,
            implementation_id: crypto.randomUUID()
          });
        }
      }

      // Create a pull request
      const { data: prData } = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
        owner: repoOwner,
        repo: repoName,
        title: `[GPT Engineer] ${prompt}`,
        head: branchName,
        base: defaultBranch,
        body: suggestions,
      });

      commitInfo = {
        hash: refData.object.sha,
        message: prompt,
        branch: branchName,
        pr: prData.number
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        suggestions,
        implementations,
        commitInfo,
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