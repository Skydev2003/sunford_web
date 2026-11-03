// Eight high-resolution sheets, eight poses per sheet, 32 poses per direction.
// Kept local and decoded once before walking starts to avoid blank frames.
export const MASCOT_WALK_SHEETS = [
  "/images/mascot/walk-right-01.webp?v=20261102-crisp3",
  "/images/mascot/walk-right-02.webp?v=20261102-crisp3",
  "/images/mascot/walk-right-03.webp?v=20261102-crisp3",
  "/images/mascot/walk-right-04.webp?v=20261102-crisp3",
  "/images/mascot/walk-left-01.webp?v=20261102-crisp3",
  "/images/mascot/walk-left-02.webp?v=20261102-crisp3",
  "/images/mascot/walk-left-03.webp?v=20261102-crisp3",
  "/images/mascot/walk-left-04.webp?v=20261102-crisp3",
] as const;
