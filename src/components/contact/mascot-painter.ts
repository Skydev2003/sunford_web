import frameLayout from "./mascot-frame-layout.json";

/** Draw into one retained surface: sheet boundaries and loop wrap never clear the pet. */
export function createMascotPainter(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { alpha: true });
  const atlas = document.createElement("canvas");
  const atlasContext = atlas.getContext("2d");
  let atlasReady = false;
  let images: HTMLImageElement[] = [];
  let width = 1;
  let height = 1;
  let ratio = 1;
  let lastDirection = -1;
  let lastPose = 0;
  let lastPaint = -1;
  let hasFrame = false;

  function frameImage(index: number) {
    return images[Math.floor(index / 8)];
  }
  function drawSource(target: CanvasRenderingContext2D, index: number) {
    const image = frameImage(index);
    const local = index % 8;
    const sw = image.naturalWidth / 4;
    const sh = image.naturalHeight / 2;
    const layout = frameLayout[index];
    const planeHeight = width / layout.aspect;
    target.drawImage(
      image,
      (local % 4) * sw,
      Math.floor(local / 4) * sh,
      sw,
      sh,
      (layout.x / 100) * width,
      (height - planeHeight) / 2 + (layout.y / 100) * planeHeight,
      width * layout.scale,
      planeHeight * layout.scale,
    );
  }
  function prepareAtlas() {
    if (!atlasContext || images.length !== 8) return;
    atlasReady = false;
    atlas.width = canvas.width * 8;
    atlas.height = canvas.height * 8;
    atlasContext.imageSmoothingEnabled = true;
    atlasContext.imageSmoothingQuality = "high";
    for (let index = 0; index < 64; index++) {
      atlasContext.setTransform(
        ratio,
        0,
        0,
        ratio,
        (index % 8) * canvas.width,
        Math.floor(index / 8) * canvas.height,
      );
      atlasContext.save();
      atlasContext.beginPath();
      atlasContext.rect(0, 0, width, height);
      atlasContext.clip();
      drawSource(atlasContext, index);
      atlasContext.restore();
    }
    atlasReady = true;
  }
  function drawPose(index: number) {
    if (!context) return;
    context.drawImage(
      atlas,
      (index % 8) * canvas.width,
      Math.floor(index / 8) * canvas.height,
      canvas.width,
      canvas.height,
      0,
      0,
      width,
      height,
    );
  }
  function paint(pose: number, direction: number) {
    if (!context || !atlasReady) return false;
    const phase = Math.floor(((pose % 32) + 32) % 32);
    const base = direction > 0 ? 0 : 32;
    const first = base + Math.floor(phase);
    if (!frameImage(first)?.complete || !frameImage(first)?.naturalWidth) return hasFrame;
    if (phase === lastPaint && direction === lastDirection) return true;

    // All destination images are verified before clearing; failures retain the last good frame.
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.globalCompositeOperation = "source-over";
    // Exactly one opaque pose per step: no duplicated feet or cross-fade blur.
    context.globalAlpha = 1;
    drawPose(first);
    hasFrame = true;
    lastDirection = direction;
    lastPose = phase;
    lastPaint = phase;
    canvas.dataset.frame = String(first);
    return true;
  }
  return {
    setImages(value: HTMLImageElement[]) {
      images = value;
      prepareAtlas();
    },
    paint,
    resize(cssWidth: number, cssHeight: number) {
      width = cssWidth;
      height = cssHeight;
      ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      lastPaint = -1;
      if (images.length) {
        prepareAtlas();
        paint(lastPose, lastDirection);
      }
    },
  };
}
