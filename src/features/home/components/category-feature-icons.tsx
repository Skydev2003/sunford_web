const shapes = {
  scales: (
    <>
      <path d="M5 11h22M8 11l2-5h12l2 5" />
      <rect x="4" y="11" width="24" height="16" rx="3" />
      <rect x="8" y="16" width="11" height="6" rx="1" />
      <path d="M23 16h1m-1 5h1" />
    </>
  ),
  indicators: (
    <>
      <rect x="3" y="5" width="26" height="18" rx="3" />
      <rect x="7" y="9" width="13" height="7" rx="1" />
      <path d="M24 10h1m-1 5h1M11 23v5m10-5v5M8 28h16" />
    </>
  ),
  accessories: (
    <>
      <path d="M11 4v7m10-7v7M16 21v3a4 4 0 0 0 4 4h7" />
      <path d="M7 11h18v4a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z" />
    </>
  ),
  platforms: (
    <>
      <path d="M4 10l19-5 6 7-19 5zM4 10v7l6 7 19-5v-7M10 17v7M6 19v8m7-4v5m13-8v5" />
    </>
  ),
};

export type CategoryFeatureCategory = keyof typeof shapes;

export function CategoryFeatureIcon({ category }: { category: CategoryFeatureCategory }) {
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
