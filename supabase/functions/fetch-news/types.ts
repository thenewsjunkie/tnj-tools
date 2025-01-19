export interface NewsSource {
  url: string;
}

export interface TrendingTopic {
  title: {
    query: string;
  };
}

export interface GoogleTrendsResponse {
  default?: {
    trendingSearchesDays?: Array<{
      trendingSearches?: TrendingTopic[];
    }>;
  };
}