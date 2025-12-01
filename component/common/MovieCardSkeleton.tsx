import React from 'react';

const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white/5 p-4 animate-pulse">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-white/10"></div>
      
      <div className="flex flex-col gap-1 mt-2">
        {/* Title Skeleton */}
        <div className="h-6 w-3/4 bg-white/10 rounded"></div>
        
        {/* Recommendation Reason Skeleton */}
        <div className="h-8 w-full bg-white/10 rounded-lg mb-3 mt-1"></div>

        {/* Year and Rating Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-12 bg-white/10 rounded"></div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-white/10 rounded-full"></div>
            <div className="h-4 w-8 bg-white/10 rounded"></div>
          </div>
        </div>

        {/* Moods Skeleton */}
        <div className="flex flex-wrap gap-1 mb-3">
          <div className="h-6 w-16 bg-white/10 rounded"></div>
          <div className="h-6 w-20 bg-white/10 rounded"></div>
          <div className="h-6 w-14 bg-white/10 rounded"></div>
        </div>

        {/* Details Skeleton */}
        <div className="flex flex-wrap gap-4 mb-3">
          <div className="h-4 w-24 bg-white/10 rounded"></div>
        </div>

        {/* Content Flags Skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
           <div className="h-4 w-16 bg-white/10 rounded"></div>
           <div className="h-4 w-20 bg-white/10 rounded"></div>
        </div>

        {/* Feedback Buttons Skeleton */}
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 h-10 bg-white/10 rounded-lg"></div>
          <div className="flex-1 h-10 bg-white/10 rounded-lg"></div>
          <div className="flex-1 h-10 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;
