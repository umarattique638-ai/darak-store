"use client";

import { use } from "react";
import Link from "next/link";
import { LuArrowLeft, LuExternalLink } from "react-icons/lu";
import { apiError, useProductQuery } from "@/store/api";
import { DashHeader } from "@/components/dashboard/ui";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useProductQuery(id);
  if (isLoading) return <Skeleton className="h-[600px]" />;
  if (!data) return <p className="text-mute">{apiError(error).message}</p>;
  const p = data.product;
  return (
    <>
      <Link href="/dashboard/products" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-mute hover:text-fg"><LuArrowLeft className="size-4 flip-rtl" /> Products</Link>
      <DashHeader title={p.name.en} text={<span>Sold {p.sold ?? 0} · <Link href={`/shop/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-accent">View in store <LuExternalLink className="size-3" /></Link></span>} />
      <ProductForm key={p.updatedAt} product={p} />
    </>
  );
}
