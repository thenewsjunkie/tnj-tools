// Routes that should exclude GlobalQueueManager (OBS and embed pages)
export const OBS_EMBED_ROUTES = [
  '/tnj-ai-obs',
  '/leaderboard/obs', 
  '/lower-third',
  '/tnjgifs-embed',
  '/fritz/current-score',
  '/fritz/total-score'
];

// Routes that start with these patterns should also exclude GlobalQueueManager
export const OBS_EMBED_ROUTE_PATTERNS = [
  '/poll/',  // Poll embed pages
];

export const shouldExcludeGlobalQueueManager = (pathname: string): boolean => {
  // Check exact routes
  if (OBS_EMBED_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Check route patterns
  return OBS_EMBED_ROUTE_PATTERNS.some(pattern => pathname.startsWith(pattern));
};