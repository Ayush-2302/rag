/**
 * Utility for combining CSS class names cleanly.
 * Filters out falsey values and handles arrays and conditional class strings.
 */
export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim();
}
