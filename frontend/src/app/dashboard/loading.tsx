import { Skeleton } from "@/components/ui/Skeleton";

/** Inside the dashboard shell (sidebar stays) — content placeholder only. */
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-10 w-56" />
      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)}</div>
      <Skeleton className="mt-6 h-80" />
    </div>
  );
}
