export default function LoadingSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse h-11   bg-elevated"
          style={{ opacity: 1 - i * 0.18 }}
        />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 300 }) {
  return <div className="animate-pulse   bg-elevated" style={{ height }} />;
}
