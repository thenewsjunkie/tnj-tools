import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function scrapeHeadlines(url: string): Promise<string[]> {
  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    if (!doc) return [];
    
    const headlines: string[] = [];

    if (url.includes('dailymail.co.uk')) {
      doc.querySelectorAll('.linkro-darkred').forEach(el => 
        headlines.push(el.textContent?.trim() || ''));
    } else if (url.includes('nypost.com')) {
      doc.querySelectorAll('h2.story__headline, h3.story__headline').forEach(el => 
        headlines.push(el.textContent?.trim() || ''));
    } else if (url.includes('businessinsider.com')) {
      doc.querySelectorAll('h2.headline').forEach(el => 
        headlines.push(el.textContent?.trim() || ''));
    } else if (url.includes('brobible.com')) {
      doc.querySelectorAll('h2.entry-title').forEach(el => 
        headlines.push(el.textContent?.trim() || ''));
    } else if (url.includes('dailydot.com')) {
      doc.querySelectorAll('h2.article-title').forEach(el => 
        headlines.push(el.textContent?.trim() || ''));
    } else if (url.includes('drudgereport.com')) {
      doc.querySelectorAll('a').forEach(el => 
        headlines.push(el.textContent?.trim() || ''));
    } else if (url.includes('mediaite.com')) {
      doc.querySelectorAll('.article-title').forEach(el => 
        headlines.push(el.textContent?.trim() || ''));
    }

    return headlines.filter(h => h.length > 0).slice(0, 5);
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  }
}