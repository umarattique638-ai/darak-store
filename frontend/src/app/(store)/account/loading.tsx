import { Skeleton } from "@/components/ui/Skeleton";

/** Inside the account layout (side nav stays) — content placeholder only. */
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-12 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      <div className="mt-10 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
    </div>
  );
}
