export async function getTrendingTopics() {
  try {
    const response = await fetch('https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-480&geo=US', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Google Trends response not OK:', response.status, response.statusText);
      return { googleTrends: [] };
    }

    const text = await response.text();
    // Remove the safety prefix from Google's response
    const data = JSON.parse(text.substring(5));
    
    if (!data?.default?.trendingSearchesDays?.[0]?.trendingSearches) {
      console.error('Unexpected Google Trends data structure:', data);
      return { googleTrends: [] };
    }

    const trends = data.default.trendingSearchesDays[0].trendingSearches
      .slice(0, 5)
      .map((trend: any) => trend.title.query)
      .filter(Boolean);

    return { googleTrends: trends };
  } catch (error) {
    console.error('Error fetching trends:', error);
    return { googleTrends: [] };
  }
}