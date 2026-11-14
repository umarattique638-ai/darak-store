"use client";

import { useRef } from "react";
import { LuCheck, LuUpload } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";

const CAPTIONS = [
  { en: "1. Create your account", ar: "١. أنشئ حسابك" },
  { en: "2. Enter the code we email you", ar: "٢. أدخل الرمز الذي نرسله لبريدك" },
  { en: "3. Describe your design", ar: "٣. صف تصميمك" },
  { en: "4. Send, and we reply with a quote", ar: "٤. أرسل، ونرد عليك بعرض سعر" },
];
const CODE = ["4", "8", "2", "1", "9", "7"];

/**
 * Autoplaying, looping walkthrough of how a customer creates an account and sends a custom design request.
 * Animated mock of the real screens (not a screen recording), so it is always up to date with no sign-in needed.
 */
export function CustomDesignWalkthrough() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = (s: string) => root.current!.querySelector(s) as HTMLElement;
        const qa = (s: string) => Array.from(root.current!.querySelectorAll(s)) as HTMLElement[];
        const ar = document.documentElement.lang === "ar";

        const show = (i: number) => {
          q("[data-wk-caption]").textContent = ar ? CAPTIONS[i]!.ar : CAPTIONS[i]!.en;
          qa("[data-wk-dot]").forEach((d, k) => d.classList.toggle("wk-on", k === i));
        };
        const typeIn = (tl: gsap.core.Timeline, sel: string, text: string, at: number, dur: number) => {
          const el = q(sel);
          const o = { n: 0 };
          tl.set(el, { textContent: "" }, at).to(o, { n: text.length, duration: dur, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(o.n))) }, at);
        };
        const groupIn = (tl: gsap.core.Timeline, sel: string, at: number) => tl.fromTo(qa(sel), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "expo.out" }, at);
        const groupOut = (tl: gsap.core.Timeline, sel: string, at: number) => tl.to(qa(sel), { opacity: 0, y: -10, duration: 0.4, ease: "power1.in" }, at);

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
        tl.call(() => qa("[data-wk-chip], [data-wk-swatch], [data-wk-dot]").forEach((el) => el.classList.remove("wk-on")), [], 0);

        // 1. Create account
        tl.call(show, [0], 0);
        tl.set(qa("[data-wk-s1]"), { opacity: 0 }, 0);
        groupIn(tl, "[data-wk-s1]", 0.1);
        typeIn(tl, "[data-wk-name]", ar ? "أحمد الكواري" : "Ahmed Al Kuwari", 0.9, 0.9);
        typeIn(tl, "[data-wk-email]", "ahmed@example.com", 2.0, 0.9);
        tl.to(q("[data-wk-btn1]"), { scale: 0.94, yoyo: true, repeat: 1, duration: 0.12 }, 3.1);
        groupOut(tl, "[data-wk-s1]", 3.6);

        // 2. Verify code
        tl.call(show, [1], 3.9);
        tl.set(qa("[data-wk-s2]"), { opacity: 0 }, 3.9);
        tl.set(qa("[data-wk-digit]"), { textContent: "" }, 3.9);
        tl.set(q("[data-wk-check]"), { opacity: 0, scale: 0 }, 3.9);
        groupIn(tl, "[data-wk-s2]", 4.0);
        qa("[data-wk-digit]").forEach((_, i) => tl.set(qa("[data-wk-digit]")[i]!, { textContent: CODE[i]! }, 4.6 + i * 0.22));
        tl.fromTo(q("[data-wk-check]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 6.0);
        groupOut(tl, "[data-wk-s2]", 6.9);

        // 3. Describe design
        tl.call(show, [2], 7.2);
        tl.set(qa("[data-wk-s3]"), { opacity: 0 }, 7.2);
        tl.call(() => qa("[data-wk-chip], [data-wk-swatch]").forEach((el) => el.classList.remove("wk-on")), [], 7.2);
        tl.set(qa("[data-wk-file]"), { opacity: 0 }, 7.2);
        groupIn(tl, "[data-wk-s3]", 7.3);
        tl.call(() => q("[data-wk-chip='sofa']").classList.add("wk-on"), [], 7.8);
        typeIn(tl, "[data-wk-w]", ar ? "240 سم" : "240 cm", 8.1, 0.6);
        typeIn(tl, "[data-wk-d]", ar ? "95 سم" : "95 cm", 8.8, 0.6);
        tl.call(() => q("[data-wk-swatch='2']").classList.add("wk-on"), [], 9.4);
        tl.fromTo(qa("[data-wk-file]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, 9.7);
        groupOut(tl, "[data-wk-s3]", 10.6);

        // 4. Send + quote
        tl.call(show, [3], 10.9);
        tl.set(qa("[data-wk-s4]"), { opacity: 0 }, 10.9);
        tl.set(q("[data-wk-toast]"), { opacity: 0, y: -12 }, 10.9);
        groupIn(tl, "[data-wk-s4]", 11.0);
        tl.to(q("[data-wk-btn2]"), { scale: 0.94, yoyo: true, repeat: 1, duration: 0.12 }, 11.9);
        tl.to(q("[data-wk-toast]"), { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 12.3);
        groupOut(tl, "[data-wk-s4]", 14.2);
        tl.to(q("[data-wk-toast]"), { opacity: 0, duration: 0.4 }, 14.2);
        tl.to({}, { duration: 0.5 }, 14.6);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative overflow-hidden rounded-[2rem] border border-line bg-page shadow-[0_40px_80px_-40px_rgba(29,27,25,0.35)]">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-3">
        <span className="flex gap-1.5"><i className="size-2.5 rounded-full bg-[#e5b3a8]" /><i className="size-2.5 rounded-full bg-[#eadbb0]" /><i className="size-2.5 rounded-full bg-[#c4dcc0]" /></span>
        <span className="mx-auto truncate rounded-full bg-page px-4 py-1 text-[12px] text-mute">alsharq.qa/custom-design</span>
      </div>

      <div className="relative aspect-[16/11] bg-surface/60 p-6 sm:p-8">
        {/* 1. Account */}
        <div data-wk-s1 className="absolute inset-6 flex flex-col justify-center gap-4 sm:inset-10">
          <p className="font-display text-2xl">Create account</p>
          <div className="rounded-xl border border-line bg-page px-4 py-3 text-[14px]"><span className="text-mute text-[12px]">Name</span><p data-wk-name className="mt-1 min-h-[1.25rem]" /></div>
          <div className="rounded-xl border border-line bg-page px-4 py-3 text-[14px]"><span className="text-mute text-[12px]">Email</span><p data-wk-email className="mt-1 min-h-[1.25rem]" /></div>
          <span data-wk-btn1 className="mt-1 inline-block w-fit rounded-full bg-accent px-6 py-2.5 text-[14px] text-page">Create account</span>
        </div>

        {/* 2. Code */}
        <div data-wk-s2 className="absolute inset-6 flex flex-col items-center justify-center gap-6 text-center sm:inset-10" style={{ opacity: 0 }}>
          <p className="font-display text-2xl">Enter the 6-digit code</p>
          <div className="flex gap-2">
            {CODE.map((_, i) => (
              <span key={i} data-wk-digit className="grid size-11 place-items-center rounded-xl border border-line bg-page font-display text-xl sm:size-12" />
            ))}
          </div>
          <span data-wk-check className="grid size-12 place-items-center rounded-full bg-accent text-page"><LuCheck className="size-6" /></span>
        </div>

        {/* 3. Design */}
        <div data-wk-s3 className="absolute inset-6 flex flex-col justify-center gap-4 sm:inset-10" style={{ opacity: 0 }}>
          <p className="font-display text-2xl">New custom design</p>
          <div className="flex flex-wrap gap-2">
            <span data-wk-chip="sofa" className="wk-chip rounded-full border px-3 py-1.5 text-[12px] transition-colors duration-500">Sofa</span>
            <span data-wk-chip="dining" className="wk-chip rounded-full border px-3 py-1.5 text-[12px] transition-colors duration-500">Dining table</span>
            <span data-wk-chip="bed" className="wk-chip rounded-full border px-3 py-1.5 text-[12px] transition-colors duration-500">Bed</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-page px-4 py-3 text-[13px]"><span className="text-mute text-[12px]">Width</span><p data-wk-w className="mt-1 min-h-[1.2rem]" /></div>
            <div className="rounded-xl border border-line bg-page px-4 py-3 text-[13px]"><span className="text-mute text-[12px]">Depth</span><p data-wk-d className="mt-1 min-h-[1.2rem]" /></div>
          </div>
          <div className="flex gap-2">
            {["#1d1b19", "#8a1538", "#c9a45c"].map((c, i) => (
              <span key={c} data-wk-swatch={i} className="wk-swatch size-7 rounded-full border-2 border-page shadow" style={{ background: c }} />
            ))}
          </div>
          <div data-wk-file className="flex items-center gap-2 rounded-xl border border-dashed border-accent bg-accent-soft px-4 py-2.5 text-[13px] text-accent" style={{ opacity: 0 }}>
            <LuUpload className="size-4" /> sketch.jpg
          </div>
        </div>

        {/* 4. Send */}
        <div data-wk-s4 className="absolute inset-6 flex flex-col items-center justify-center gap-5 text-center sm:inset-10" style={{ opacity: 0 }}>
          <p className="font-display text-2xl">Review and send</p>
          <span data-wk-btn2 className="inline-block rounded-full bg-accent px-8 py-3 text-[14px] text-page">Send design request</span>
          <div data-wk-toast className="absolute bottom-6 end-6 start-6 flex items-center gap-3 rounded-2xl bg-fg px-5 py-3.5 text-left text-[13px] text-page shadow-xl sm:start-auto sm:w-[320px]" style={{ opacity: 0 }}>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent"><LuCheck className="size-4" /></span>
            Request sent. Your quote arrives within 2 days.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-4">
        <p data-wk-caption className="text-[14px] font-medium text-fg">{CAPTIONS[0]!.en}</p>
        <div className="flex gap-1.5">
          {CAPTIONS.map((_, i) => (
            <span key={i} data-wk-dot className="h-1.5 w-4 rounded-full bg-line transition-all duration-500" />
          ))}
        </div>
      </div>
    </div>
  );
}
