import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-11 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-6 h-12" />
      <Skeleton className="h-12" />
      <Skeleton className="h-12 rounded-full" />
    </div>
  );
}
