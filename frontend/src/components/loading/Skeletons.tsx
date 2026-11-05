import { Skeleton } from "@/components/ui/Skeleton";

/** Instant placeholders shown by loading.tsx while a page's data is fetched. */
export function PageHeaderSkeleton() {
  return (
    <div className="container-x pt-36 pb-12 lg:pt-44">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-14 w-2/3 max-w-xl" />
      <Skeleton className="mt-5 h-4 w-1/2 max-w-md" />
      <div className="mt-12 h-px bg-line" />
    </div>
  );
}

export function CardGridSkeleton({ count = 6, cols = "grid-cols-2 md:grid-cols-3" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid gap-x-4 gap-y-10 lg:gap-x-6 ${cols}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] rounded-2xl" />
          <Skeleton className="mt-4 h-3 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="container-x grid gap-6 pb-24 md:grid-cols-3">
        <Skeleton className="h-64 md:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    </>
  );
}
