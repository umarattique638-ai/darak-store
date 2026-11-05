export function AuthHeading({ title, text }: { title: string; text?: React.ReactNode }) {
  return (
    <div className="mb-9 animate-[toastIn_.7s_both]">
      <h1 className="display text-[2.6rem]">{title}</h1>
      {text && <p className="mt-3 leading-relaxed text-mute">{text}</p>}
    </div>
  );
}
