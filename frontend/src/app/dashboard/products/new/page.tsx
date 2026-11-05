import { DashHeader } from "@/components/dashboard/ui";
import { ProductForm } from "@/components/dashboard/ProductForm";

export const metadata = { title: "New product" };

export default function NewProduct() {
  return (
    <>
      <DashHeader title="New product" text="English is required; Arabic is shown to Arabic visitors (falls back to English)." />
      <ProductForm />
    </>
  );
}
