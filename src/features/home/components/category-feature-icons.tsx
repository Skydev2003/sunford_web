import type { HomeImageSlot } from "../data/image-slots";

const shapes = {
  digital: (
    <>
      <path d="M5 11h22M8 11l2-5h12l2 5" />
      <rect x="4" y="11" width="24" height="16" rx="3" />
      <rect x="8" y="16" width="11" height="6" rx="1" />
      <path d="M23 16h1m-1 5h1" />
    </>
  ),
  smart: (
    <>
      <path d="M8 7a13 13 0 0 1 16 0M12 10a7 7 0 0 1 8 0M16 13h.01M5 17h22" />
      <rect x="4" y="17" width="24" height="11" rx="3" />
      <path d="M9 22h9m5 0v1" />
    </>
  ),
  accessories: (
    <>
      <path d="M11 4v7m10-7v7M16 21v3a4 4 0 0 0 4 4h7" />
      <path d="M7 11h18v4a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z" />
    </>
  ),
  software: (
    <>
      <rect x="3" y="5" width="26" height="23" rx="3" />
      <path d="M3 12h26M7 8.5h.01M11 8.5h.01M12 17l-3 3 3 3m8-6 3 3-3 3m-3-7-2 8" />
    </>
  ),
};

export function CategoryFeatureIcon({
  category,
}: {
  category: Exclude<HomeImageSlot, "spotlight">;
}) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[category]}
    </svg>
  );
}
