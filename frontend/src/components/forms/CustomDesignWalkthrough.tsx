"use client";

import { useRef } from "react";
import { LuCheck, LuMousePointer2, LuUpload } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLocalized } from "@/i18n/client";

const STEPS = [
  { en: "Create your account", ar: "أنشئ حسابك" },
  { en: "Enter the code we email you", ar: "أدخل الرمز الذي نرسله لبريدك" },
  { en: "Describe your design", ar: "صف تصميمك" },
  { en: "Send and get a quote", ar: "أرسل واحصل على عرض سعر" },
];
const CODE = ["4", "8", "2", "1", "9", "7"];

/**
 * Autoplaying walkthrough: a step list on the left, and on the right a screen where a cursor
 * moves, clicks and fills the form. An animated mock of the real screens, not a screen recording.
 */
export function CustomDesignWalkthrough() {
  const root = useRef<HTMLDivElement>(null);
  const L = useLocalized();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = (s: string) => root.current!.querySelector(s) as HTMLElement;
        const qa = (s: string) => Array.from(root.current!.querySelectorAll(s)) as HTMLElement[];
        const stage = q("[data-wk-stage]");
        const cursor = q("[data-wk-cursor]");
        const ripple = q("[data-wk-ripple]");
        const ar = document.documentElement.lang === "ar";

        // Cursor target = centre of an element, relative to the stage.
        const center = (sel: string) => {
          const s = stage.getBoundingClientRect();
          const r = q(sel).getBoundingClientRect();
          return { x: r.left - s.left + r.width / 2 - 4, y: r.top - s.top + r.height / 2 - 4 };
        };

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });

        const moveTo = (sel: string, at: number, dur = 0.7) =>
          tl.to(cursor, { x: () => center(sel).x, y: () => center(sel).y, duration: dur, ease: "power3.inOut" }, at);
        const click = (at: number) => {
          tl.fromTo(ripple, { scale: 0.3, opacity: 0.7 }, { scale: 1.8, opacity: 0, duration: 0.55, ease: "power1.out" }, at);
          tl.to(cursor, { scale: 0.82, duration: 0.1, yoyo: true, repeat: 1 }, at);
        };
        const typeIn = (sel: string, text: string, at: number, dur: number) => {
          const el = q(sel);
          const o = { n: 0 };
          tl.set(el, { textContent: "" }, at);
          tl.to(o, { n: text.length, duration: dur, ease: "none", onUpdate: () => { el.textContent = text.slice(0, Math.round(o.n)); } }, at);
        };
        const stepAt = (i: number, at: number) =>
          tl.call(() => qa("[data-wk-step]").forEach((el, k) => { el.classList.toggle("wk-on", k === i); el.classList.toggle("wk-done", k < i); }), [], at);
        const scene = (n: number, inAt: number, outAt: number) => {
          const els = qa(`[data-wk-scene='${n}']`);
          tl.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, inAt);
          tl.to(els, { opacity: 0, y: -10, duration: 0.35, ease: "power1.in" }, outAt);
        };

        // Reset selections at the start of each loop.
        tl.call(() => qa("[data-wk-chip], [data-wk-swatch]").forEach((el) => el.classList.remove("wk-on")), [], 0);
        tl.set(cursor, { x: 40, y: 40 }, 0);

        // 1. Create account
        stepAt(0, 0);
        scene(1, 0.2, 5.5);
        moveTo("[data-wk-f-name]", 0.8);
        typeIn("[data-wk-name]", ar ? "أحمد الكواري" : "Ahmed Al Kuwari", 1.6, 1.0);
        moveTo("[data-wk-f-email]", 2.8, 0.6);
        typeIn("[data-wk-email]", "ahmed@example.com", 3.4, 0.9);
        moveTo("[data-wk-btn1]", 4.5, 0.6);
        click(5.1);

        // 2. Enter the code
        stepAt(1, 5.7);
        scene(2, 5.8, 9.0);
        tl.set(qa("[data-wk-digit]"), { textContent: "" }, 5.7);
        tl.set(q("[data-wk-check]"), { opacity: 0 }, 5.7);
        CODE.forEach((d, i) => tl.set(qa("[data-wk-digit]")[i]!, { textContent: d }, 6.3 + i * 0.25));
        tl.fromTo(q("[data-wk-check]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 7.8);

        // 3. Describe the design
        stepAt(2, 9.2);
        scene(3, 9.3, 14.0);
        tl.set(q("[data-wk-upload]"), { opacity: 0 }, 9.2);
        moveTo("[data-wk-chip='sofa']", 9.6, 0.6);
        click(10.2);
        tl.call(() => q("[data-wk-chip='sofa']").classList.add("wk-on"), [], 10.3);
        typeIn("[data-wk-w]", ar ? "240 سم" : "240 cm", 10.6, 0.6);
        typeIn("[data-wk-d]", ar ? "95 سم" : "95 cm", 11.3, 0.6);
        moveTo("[data-wk-swatch='1']", 12.0, 0.6);
        click(12.6);
        tl.call(() => q("[data-wk-swatch='1']").classList.add("wk-on"), [], 12.65);
        tl.fromTo(q("[data-wk-upload]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, 12.9);

        // 4. Send and get a quote
        stepAt(3, 14.2);
        scene(4, 14.3, 17.4);
        tl.set(q("[data-wk-toast]"), { opacity: 0 }, 14.2);
        moveTo("[data-wk-btn2]", 14.6, 0.6);
        click(15.2);
        tl.fromTo(q("[data-wk-toast]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" }, 15.5);
        tl.to(q("[data-wk-toast]"), { opacity: 0, duration: 0.4 }, 17.2);

        tl.to({}, { duration: 0.4 }, 17.8);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative overflow-hidden rounded-[2rem] border border-line bg-page shadow-[0_40px_80px_-40px_rgba(29,27,25,0.35)]">
      <div className="grid md:grid-cols-[0.8fr_1.2fr]">
        <ol className="flex gap-2 overflow-x-auto border-b border-line bg-surface p-4 md:flex-col md:gap-3 md:border-b-0 md:border-e md:p-6">
          {STEPS.map((s, i) => (
            <li key={s.en} data-wk-step className="wk-step flex shrink-0 items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-500">
              <span className="wk-num grid size-8 shrink-0 place-items-center rounded-full border border-line font-display text-[15px] transition-colors duration-500">{i + 1}</span>
              <span className="text-[14px] font-medium leading-snug">{L(s)}</span>
            </li>
          ))}
        </ol>

        <div data-wk-stage className="relative aspect-[4/3] min-h-[420px] overflow-hidden bg-page md:aspect-auto">
          {/* 1. Account */}
          <div data-wk-scene="1" className="absolute inset-0 flex flex-col justify-center gap-4 p-8 sm:p-10">
            <p className="font-display text-2xl">{L({ en: "Create account", ar: "إنشاء حساب" })}</p>
            <div data-wk-f-name className="rounded-xl border border-line bg-page px-4 py-3">
              <span className="block text-[11px] uppercase tracking-wider text-mute">{L({ en: "Full name", ar: "الاسم الكامل" })}</span>
              <span data-wk-name className="mt-1 block min-h-[1.25rem] text-[15px]" />
            </div>
            <div data-wk-f-email className="rounded-xl border border-line bg-page px-4 py-3">
              <span className="block text-[11px] uppercase tracking-wider text-mute">{L({ en: "Email", ar: "البريد الإلكتروني" })}</span>
              <span data-wk-email className="mt-1 block min-h-[1.25rem] text-[15px]" />
            </div>
            <span data-wk-btn1 className="mt-2 inline-block w-fit rounded-full bg-accent px-7 py-3 text-[14px] text-page">{L({ en: "Create account", ar: "إنشاء الحساب" })}</span>
          </div>

          {/* 2. Code */}
          <div data-wk-scene="2" className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <p className="font-display text-2xl">{L({ en: "Enter the 6-digit code", ar: "أدخل الرمز المكون من 6 أرقام" })}</p>
            <div className="flex gap-2">
              {CODE.map((_, i) => (
                <span key={i} data-wk-digit className="wk-digit grid size-11 place-items-center rounded-xl border border-line bg-page font-display text-xl transition-colors duration-300 sm:size-12" />
              ))}
            </div>
            <span data-wk-check className="grid size-12 place-items-center rounded-full bg-accent text-page"><LuCheck className="size-6" /></span>
          </div>

          {/* 3. Design */}
          <div data-wk-scene="3" className="absolute inset-0 flex flex-col justify-center gap-4 p-8 sm:p-10">
            <p className="font-display text-2xl">{L({ en: "New custom design", ar: "تصميم مخصص جديد" })}</p>
            <div className="flex flex-wrap gap-2">
              <span data-wk-chip="sofa" className="wk-chip rounded-full border border-line px-4 py-2 text-[13px]">{L({ en: "Sofa", ar: "كنب" })}</span>
              <span data-wk-chip="dining" className="wk-chip rounded-full border border-line px-4 py-2 text-[13px]">{L({ en: "Dining table", ar: "طاولة طعام" })}</span>
              <span data-wk-chip="bed" className="wk-chip rounded-full border border-line px-4 py-2 text-[13px]">{L({ en: "Bed", ar: "سرير" })}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-page px-4 py-3"><span className="block text-[11px] uppercase tracking-wider text-mute">{L({ en: "Width", ar: "العرض" })}</span><span data-wk-w className="mt-1 block min-h-[1.2rem] text-[14px]" /></div>
              <div className="rounded-xl border border-line bg-page px-4 py-3"><span className="block text-[11px] uppercase tracking-wider text-mute">{L({ en: "Depth", ar: "العمق" })}</span><span data-wk-d className="mt-1 block min-h-[1.2rem] text-[14px]" /></div>
            </div>
            <div className="flex items-center gap-3">
              {["#1d1b19", "#8a1538", "#b8925a"].map((c, i) => (
                <span key={c} data-wk-swatch={i} className="wk-swatch size-8 rounded-full border-2 border-page shadow" style={{ background: c }} />
              ))}
            </div>
            <div data-wk-upload className="flex w-fit items-center gap-2 rounded-xl border border-dashed border-accent bg-accent-soft px-4 py-2.5 text-[13px] text-accent">
              <LuUpload className="size-4" /> sketch.jpg
            </div>
          </div>

          {/* 4. Send */}
          <div data-wk-scene="4" className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
            <p className="font-display text-2xl">{L({ en: "Review and send", ar: "راجع وأرسل" })}</p>
            <span data-wk-btn2 className="inline-block rounded-full bg-accent px-8 py-3 text-[14px] text-page">{L({ en: "Send design request", ar: "إرسال طلب التصميم" })}</span>
            <div data-wk-toast className="absolute inset-x-6 bottom-6 flex items-center gap-3 rounded-2xl bg-fg px-5 py-3.5 text-start text-[13px] text-page shadow-xl" style={{ opacity: 0 }}>
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent"><LuCheck className="size-4" /></span>
              {L({ en: "Request sent. Your quote arrives within 2 days.", ar: "تم الإرسال. يصلك عرض السعر خلال يومين." })}
            </div>
          </div>

          {/* Cursor */}
          <div data-wk-cursor className="pointer-events-none absolute left-0 top-0 z-10">
            <LuMousePointer2 className="size-6 fill-page text-fg drop-shadow-md" />
            <span data-wk-ripple className="absolute -left-4 -top-4 size-9 rounded-full bg-accent/40 opacity-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
