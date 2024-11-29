import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { NewsSource } from "./types.ts";

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

const NEWS_SOURCES: NewsSource[] = [
  { url: 'https://www.dailymail.co.uk/news/headlines/index.html' },
  { url: 'https://nypost.com' },
  { url: 'https://www.businessinsider.com' }
];

export async function scrapeHeadlines(): Promise<string> {
  let allHeadlines: string[] = [];
  
  for (const source of NEWS_SOURCES) {
    try {
      console.log(`Fetching headlines from ${source.url}`);
      const response = await fetchWithTimeout(source.url);
      if (!response.ok) {
        console.error(`Failed to fetch ${source.url}: ${response.status}`);
        continue;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      if (!doc) continue;
      
      const headlines: string[] = [];

      if (source.url.includes('dailymail.co.uk')) {
        doc.querySelectorAll('.linkro-darkred').forEach(el => 
          headlines.push(el.textContent?.trim() || ''));
      } else if (source.url.includes('nypost.com')) {
        doc.querySelectorAll('h2.story__headline, h3.story__headline').forEach(el => 
          headlines.push(el.textContent?.trim() || ''));
      } else if (source.url.includes('businessinsider.com')) {
        doc.querySelectorAll('h2.headline').forEach(el => 
          headlines.push(el.textContent?.trim() || ''));
      }

      allHeadlines = [...allHeadlines, ...headlines.slice(0, 3)];
    } catch (error) {
      console.error(`Error scraping ${source.url}:`, error);
      continue;
    }
  }

  return allHeadlines
    .filter(h => h.length > 0)
    .slice(0, 5)
    .join('\n');
}