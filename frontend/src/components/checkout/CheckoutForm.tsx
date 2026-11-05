"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LuBanknote, LuBuilding2, LuCheck, LuLock } from "react-icons/lu";
import { useI18n, useLocalized } from "@/i18n/client";
import { formatMoney } from "@/i18n/format";
import { useAppDispatch, useCart, useCurrentUser } from "@/store/hooks";
import { clearCart } from "@/store/cartSlice";
import { apiError, useCheckoutMutation, useQuoteMutation, useSettingsQuery } from "@/store/api";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, TextArea, TextInput } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { cn, imageUrl } from "@/lib/utils";
import type { PaymentMethod, ShippingAddress } from "@/types/api";

const EMPTY: ShippingAddress = { fullName: "", phone: "", city: "Doha", area: "", street: "", building: "", notes: "" };

export function CheckoutForm() {
  const { t, locale } = useI18n();
  const L = useLocalized();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const { items, hydrated } = useCart();
  const { data: settings } = useSettingsQuery();
  const [quote, { data: q }] = useQuoteMutation();
  const [checkout, { isLoading }] = useCheckoutMutation();

  const saved = useMemo(() => user?.addresses ?? [], [user]);
  // null = not chosen yet → fall back to the default saved address (or a new one)
  const [pickedId, setAddrId] = useState<string | null>(null);
  const [edits, setAddr] = useState<Partial<ShippingAddress>>({});
  const [save, setSave] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState(false);

  const defaultId = (saved.find((a) => a.isDefault) ?? saved[0])?.id ?? "new";
  const addrId = pickedId ?? defaultId;
  const addr: ShippingAddress = { ...EMPTY, fullName: user?.name ?? "", phone: user?.phone ?? "", ...edits };

  useEffect(() => {
    if (items.length) quote({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (!hydrated) return <Skeleton className="h-96" />;
  if (!items.length && !placed)
    return (
      <div className="py-20 text-center">
        <p className="font-display text-3xl">{t.cart.empty}</p>
        <ButtonLink href="/shop" className="mt-6">{t.common.shopNow}</ButtonLink>
      </div>
    );

  const set = (k: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAddr((a) => ({ ...a, [k]: e.target.value }));
  const err = (k: string) => errors[`shippingAddress.${k}`] ?? errors[k];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const chosen = addrId === "new" ? addr : saved.find((a) => a.id === addrId);
    if (!chosen) return;
    const { fullName, phone, city, area, street, building, notes } = chosen;
    try {
      const { order } = await checkout({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })),
        shippingAddress: { fullName, phone, city, area, street, building, notes },
        paymentMethod: method,
        customerNote: note,
        saveAddress: addrId === "new" && save,
      }).unwrap();
      setPlaced(true);
      dispatch(clearCart());
      router.replace(`/checkout/success/${order.orderNumber}`);
    } catch (e2) {
      const a = apiError(e2);
      setErrors(a.fields);
      toast.error(a.message);
      if (a.code === "OUT_OF_STOCK" || a.code === "CART_INVALID") quote({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })) });
    }
  };

  const radio = (active: boolean) => cn("relative flex w-full cursor-pointer gap-4 rounded-2xl border-2 p-5 text-start transition-all", active ? "border-accent bg-accent-soft/50" : "border-line bg-white hover:border-fg/30");

  return (
    <form onSubmit={submit} noValidate className="grid gap-12 lg:grid-cols-[1fr_420px]">
      <div className="space-y-12">
        <section>
          <h2 className="flex items-center gap-3 font-display text-2xl"><span className="grid size-8 place-items-center rounded-full bg-fg text-sm text-page">1</span>{t.checkout.shippingTitle}</h2>
          {saved.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t.checkout.savedAddresses}>
              {saved.map((a) => (
                <button type="button" role="radio" aria-checked={addrId === a.id} key={a.id} onClick={() => setAddrId(a.id)} className={radio(addrId === a.id)}>
                  <div className="text-sm">
                    <p className="font-semibold">{a.label} {a.isDefault && <span className="ms-1 text-xs text-accent">· {t.account.default}</span>}</p>
                    <p className="mt-1 text-mute">{a.fullName} · {a.phone}</p>
                    <p className="text-mute">{[a.building, a.street, a.area, a.city].filter(Boolean).join(", ")}</p>
                  </div>
                  {addrId === a.id && <LuCheck className="absolute end-4 top-4 size-5 text-accent" />}
                </button>
              ))}
              <button type="button" role="radio" aria-checked={addrId === "new"} onClick={() => setAddrId("new")} className={cn(radio(addrId === "new"), "items-center justify-center font-semibold")}>+ {t.checkout.newAddress}</button>
            </div>
          )}
          {addrId === "new" && (
            <div className="mt-6 grid animate-[fadeIn_.4s] gap-5 sm:grid-cols-2">
              <TextInput id="fullName" label={t.checkout.fullName} value={addr.fullName} onChange={set("fullName")} error={err("fullName")} autoComplete="name" required />
              <TextInput id="phone" label={t.checkout.phone} value={addr.phone} onChange={set("phone")} error={err("phone")} autoComplete="tel" inputMode="tel" placeholder="+974 5555 1234" required />
              <TextInput id="city" label={t.checkout.city} value={addr.city} onChange={set("city")} error={err("city")} autoComplete="address-level2" required />
              <TextInput id="area" label={t.checkout.area} value={addr.area} onChange={set("area")} error={err("area")} optional={t.common.optional} />
              <TextInput id="street" label={t.checkout.street} value={addr.street} onChange={set("street")} error={err("street")} autoComplete="address-line1" className="sm:col-span-2" required />
              <TextInput id="building" label={t.checkout.building} value={addr.building} onChange={set("building")} error={err("building")} optional={t.common.optional} />
              <TextInput id="notes" label={t.checkout.notes} value={addr.notes} onChange={set("notes")} optional={t.common.optional} />
              <Checkbox label={t.checkout.saveAddress} checked={save} onChange={(e) => setSave(e.target.checked)} className="sm:col-span-2" />
            </div>
          )}
        </section>

        <section>
          <h2 className="flex items-center gap-3 font-display text-2xl"><span className="grid size-8 place-items-center rounded-full bg-fg text-sm text-page">2</span>{t.checkout.paymentTitle}</h2>
          <div className="mt-6 grid gap-3" role="radiogroup" aria-label={t.checkout.paymentTitle}>
            <button type="button" role="radio" aria-checked={method === "cod"} onClick={() => setMethod("cod")} className={radio(method === "cod")}>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white shadow-sm"><LuBanknote className="size-6 text-accent" /></span>
              <span><span className="block font-semibold">{t.checkout.cod}</span><span className="text-sm text-mute">{t.checkout.codText}</span></span>
              {method === "cod" && <LuCheck className="absolute end-5 top-5 size-5 text-accent" />}
            </button>
            <button type="button" role="radio" aria-checked={method === "bank_transfer"} onClick={() => setMethod("bank_transfer")} className={radio(method === "bank_transfer")}>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white shadow-sm"><LuBuilding2 className="size-6 text-accent" /></span>
              <span><span className="block font-semibold">{t.checkout.bank}</span><span className="text-sm text-mute">{t.checkout.bankText}</span></span>
              {method === "bank_transfer" && <LuCheck className="absolute end-5 top-5 size-5 text-accent" />}
            </button>
            {method === "bank_transfer" && settings && (
              <dl className="grid animate-[fadeIn_.4s] grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-2xl bg-dark p-6 text-sm text-page">
                <dt className="col-span-2 mb-2 eyebrow text-gold">{t.checkout.bankDetails}</dt>
                <dt className="text-page/60">{t.checkout.bankName}</dt><dd className="font-semibold">{settings.bank.name}</dd>
                <dt className="text-page/60">{t.checkout.accountName}</dt><dd className="font-semibold">{settings.bank.accountName}</dd>
                <dt className="text-page/60">{t.checkout.iban}</dt><dd dir="ltr" className="font-mono font-semibold rtl:text-end">{settings.bank.iban}</dd>
                <dt className="text-page/60">{t.checkout.reference}</dt><dd>{t.checkout.orderNumber}</dd>
              </dl>
            )}
          </div>
          <TextArea id="note" label={t.checkout.note} value={note} onChange={(e) => setNote(e.target.value)} optional={t.common.optional} maxLength={500} rows={3} className="mt-6" />
        </section>
      </div>

      <aside className="h-fit rounded-3xl bg-surface p-7 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">{t.checkout.reviewTitle}</h2>
        <ul className="mt-6 max-h-80 space-y-4 overflow-y-auto pe-1">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-4">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white">
                {i.image && <Image src={imageUrl(i.image, 160)} alt="" fill unoptimized sizes="64px" className="object-cover" />}
                <span className="absolute -end-0 -top-0 grid size-5 place-items-center rounded-bl-lg bg-fg text-[11px] font-bold text-page rtl:rounded-br-lg rtl:rounded-bl-none">{i.quantity}</span>
              </span>
              <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-semibold">{L(i.name)}</span>{i.color && <span className="text-mute">{i.color}</span>}</span>
              <span className="text-sm font-semibold">{formatMoney(i.price * i.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-3 border-t border-line pt-6 text-[15px]">
          <div className="flex justify-between"><dt className="text-mute">{t.common.subtotal}</dt><dd>{q ? formatMoney(q.subtotal, locale) : "…"}</dd></div>
          <div className="flex justify-between"><dt className="text-mute">{t.common.shipping}</dt><dd>{q ? (q.shippingFee ? formatMoney(q.shippingFee, locale) : t.common.free) : "…"}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 text-xl font-bold"><dt>{t.common.total}</dt><dd>{q ? formatMoney(q.total, locale) : "…"}</dd></div>
        </dl>
        {q?.problems.map((p) => <p key={p.productId} className="mt-3 text-sm text-red-600">{p.message}</p>)}
        <Button type="submit" size="lg" className="mt-7 w-full" loading={isLoading} disabled={!q || !!q.problems.length}>
          <LuLock className="size-4" /> {isLoading ? t.checkout.placing : t.checkout.placeOrder}
        </Button>
        <p className="mt-4 text-center text-xs text-mute">{user?.email}</p>
      </aside>
    </form>
  );
}
