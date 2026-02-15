

## Add Real-Time Web Search to Rundowns Using OpenAI Search Models

### Problem

GPT-4o has a training data cutoff, so for current events it either refuses to answer or provides outdated information. The rundown and strongman modes need access to live, up-to-date information.

### Solution

OpenAI offers dedicated search models that have built-in web search -- no extra API keys or services needed. For rundown and strongman modes, switch from `gpt-4o` to `gpt-4o-search-preview`, which automatically searches the web and returns current, sourced information.

Your existing `OPENAI_API_KEY` already works with these models. No new secrets or connectors needed.

### Changes

**File: `supabase/functions/ask-ai/index.ts`**

1. When `rundownMode` or `strongmanMode` is true, override the model to `gpt-4o-search-preview` (ignoring whatever model the user selected in the dropdown)
2. For search models, use the `web_search_options` parameter to enable web search with medium context size
3. Remove `presence_penalty` and `frequency_penalty` for search model calls (not supported by search models)
4. All other modes (ELI5, detailed, datasheet, general) continue using GPT-4o as before

### Technical Details

The key change in the API call for rundown/strongman:

```text
model: "gpt-4o-search-preview"
web_search_options: { search_context_size: "medium" }
// No presence_penalty or frequency_penalty (unsupported by search models)
```

The response format is identical -- `data.choices[0].message.content` -- so no frontend changes are needed. The search model will automatically find and cite current sources.

### Files Modified

1. `supabase/functions/ask-ai/index.ts` -- use `gpt-4o-search-preview` with `web_search_options` for rundown/strongman modes

