// components/skeletons/QuizCardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

const QuizCardSkeleton = () => {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
};

const FilterPanelSkeleton = () => {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Filter Skeleton */}
        <div>
          <Skeleton className="h-5 w-16 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Filter Skeleton */}
        <div>
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Tags Filter Skeleton */}
        <div>
          <Skeleton className="h-5 w-8 mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchBarSkeleton = () => {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Skeleton className="h-12 flex-1 w-full rounded-lg" />
        <Skeleton className="h-12 w-20 rounded-lg" />
        <Skeleton className="h-12 w-32 rounded-lg" />
      </div>
    </div>
  );
};

export const QuizPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-2" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Search Bar Skeleton */}
        <SearchBarSkeleton />

        {/* Filter Panel Skeleton */}
        <FilterPanelSkeleton />

        {/* Results Summary Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Quiz Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <QuizCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton untuk load more state
export const LoadMoreSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <QuizCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Skeleton untuk filtering state
export const FilteringSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <QuizCardSkeleton key={i} />
      ))}
    </div>
  );
};
