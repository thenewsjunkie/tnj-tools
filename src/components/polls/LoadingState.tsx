export function LoadingState() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-48 bg-black/20 rounded-lg" />
      ))}
    </div>
  );
}