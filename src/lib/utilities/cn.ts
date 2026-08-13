import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Compose Tailwind class lists with conflict resolution. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
