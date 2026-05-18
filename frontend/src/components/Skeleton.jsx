import React from 'react';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex gap-4">
      <Skeleton className="h-32 w-1/3" />
      <Skeleton className="h-32 w-1/3" />
      <Skeleton className="h-32 w-1/3" />
    </div>
    <Skeleton className="h-64 w-full" />
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export default Skeleton;
