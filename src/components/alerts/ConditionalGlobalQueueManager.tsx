// Server-side alert processing is now handled entirely by Edge Functions
// No client-side queue manager needed
const ConditionalGlobalQueueManager = () => {
  return null;
};

export default ConditionalGlobalQueueManager;