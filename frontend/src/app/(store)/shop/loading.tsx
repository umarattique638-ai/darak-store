import { Skeleton } from "@/components/ui/Skeleton";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/loading/Skeletons";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <section className="container-x pb-28">
        <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
          <div className="hidden space-y-4 lg:block">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-8" />)}
          </div>
          <div>
            <Skeleton className="mb-8 h-12" />
            <CardGridSkeleton count={6} cols="grid-cols-2 lg:grid-cols-3" />
          </div>
        </div>
      </section>
    </>
  );
}
