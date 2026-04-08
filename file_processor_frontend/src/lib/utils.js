import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely without style conflicts.
 * Example: cn("bg-blue-500", isHovered && "bg-blue-600")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}