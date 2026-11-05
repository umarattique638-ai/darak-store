import { LogoMark } from "@/components/ui/Logo";

/** Shown instantly when entering a different area (store ↔ dashboard ↔ sign-in). */
export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-page" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-5">
        <LogoMark className="size-14 animate-pulse" />
        <span className="h-1 w-28 overflow-hidden rounded-full bg-line">
          <span className="block h-full w-1/3 animate-[loaderSlide_1.1s_ease-in-out_infinite] rounded-full bg-accent" />
        </span>
      </div>
    </div>
  );
}
