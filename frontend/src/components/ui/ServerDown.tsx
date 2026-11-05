import { LuServerOff } from "react-icons/lu";

export function ServerDown() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center pt-28 text-center">
      <LuServerOff className="size-12 text-mute" />
      <h1 className="mt-4 font-display text-3xl">We can&apos;t reach the server</h1>
      <p className="mt-2 text-mute">Please try again in a moment.</p>
    </div>
  );
}
