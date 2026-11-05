import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-x pt-28 pb-24 lg:pt-32">
      <Skeleton className="mb-8 h-3 w-64" />
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Skeleton className="aspect-square rounded-3xl" />
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-12 w-3/4" />
          <Skeleton className="mt-5 h-7 w-32" />
          <div className="mt-8 flex gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="size-11 rounded-full" />)}</div>
          <div className="mt-8 flex gap-3"><Skeleton className="h-14 w-32 rounded-full" /><Skeleton className="h-14 flex-1 rounded-full" /></div>
          <Skeleton className="mt-8 h-20" />
          <Skeleton className="mt-8 h-40" />
        </div>
      </div>
    </div>
  );
}
