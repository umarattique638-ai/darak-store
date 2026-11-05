import en, { type Dictionary } from "./en";
import ar from "./ar";
import type { Locale } from "../config";

export const dictionaries: Record<Locale, Dictionary> = { en, ar };
export type { Dictionary };
