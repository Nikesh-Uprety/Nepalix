interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={`rounded-lg animate-pulse bg-white/5 ${className}`}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-[#0F172A]/60 p-6 ${className}`}>
      <Skeleton className="w-10 h-10 rounded-xl mb-4" />
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-full h-3 mb-1.5" />
      <Skeleton className="w-4/5 h-3 mb-1.5" />
      <Skeleton className="w-2/3 h-3" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#070B14] pt-32 px-6 animate-pulse">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Skeleton className="w-32 h-7 rounded-full mx-auto mb-6" />
        <Skeleton className="w-3/4 h-16 mx-auto mb-4" />
        <Skeleton className="w-1/2 h-16 mx-auto mb-8" />
        <Skeleton className="w-2/3 h-5 mx-auto mb-2" />
        <Skeleton className="w-1/2 h-5 mx-auto" />
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
