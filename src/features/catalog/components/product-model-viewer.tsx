"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { Box, LoaderCircle, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";

const initialOrbit = "25deg 65deg auto";

export function ProductModelViewer({
  src,
  name,
  poster,
}: {
  src: string;
  name: string;
  poster?: string;
}) {
  const viewer = useRef<ModelViewerElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    let disposed = false;
    const loaded = () => {
      if (!disposed) setStatus("ready");
    };
    const failed = () => {
      if (!disposed) setStatus("error");
    };
    element.addEventListener("load", loaded);
    element.addEventListener("error", failed);
    // Register the web component in the browser, keeping WebGL out of SSR.
    import("@google/model-viewer")
      .then(() => {
        if (element.loaded) loaded();
      })
      .catch(failed);
    return () => {
      disposed = true;
      element.removeEventListener("load", loaded);
      element.removeEventListener("error", failed);
    };
  }, [src]);

  const reset = () => {
    if (!viewer.current) return;
    viewer.current.cameraOrbit = initialOrbit;
    viewer.current.cameraTarget = "auto auto auto";
    viewer.current.fieldOfView = "30deg";
  };

  return (
    <div className="product-model" data-status={status}>
      {createElement("model-viewer", {
        ref: viewer,
        src,
        alt: `โมเดล 3 มิติ ${name}`,
        poster,
        "camera-controls": "",
        "disable-pan": "",
        "touch-action": "pan-y",
        "camera-orbit": initialOrbit,
        "min-camera-orbit": "auto 10deg 35%",
        "max-camera-orbit": "auto 90deg 120%",
        "field-of-view": "30deg",
        "environment-image": "neutral",
        "shadow-intensity": "0.8",
        "shadow-softness": "1",
        "interaction-prompt": "none",
        loading: "eager",
        reveal: "auto",
        exposure: "1",
        "aria-describedby": "model-interaction-hint",
      })}
      <span className="model-badge">
        <Box size={15} /> 3 มิติ
      </span>
      {status === "loading" && (
        <div className="model-loading" role="status">
          <LoaderCircle size={22} aria-hidden="true" />
          <span>กำลังโหลดโมเดล…</span>
        </div>
      )}
      {status === "error" && (
        <div className="model-fallback" role="status">
          <ProductImage src={poster} alt={name} fill sizes="(max-width: 900px) 90vw, 50vw" />
          <p>ไม่สามารถแสดงโมเดลได้ กรุณาเลือกดูรูปสินค้าด้านล่าง</p>
        </div>
      )}
      {status === "ready" && (
        <div className="model-toolbar">
          <p id="model-interaction-hint">ลากเพื่อหมุน · เลื่อนหรือกางนิ้วเพื่อซูม</p>
          <div className="model-buttons" aria-label="ควบคุมโมเดลสินค้า">
            <button type="button" onClick={() => viewer.current?.zoom(2)} aria-label="ซูมเข้า">
              <ZoomIn size={18} />
            </button>
            <button type="button" onClick={() => viewer.current?.zoom(-2)} aria-label="ซูมออก">
              <ZoomOut size={18} />
            </button>
            <button type="button" onClick={reset} aria-label="กลับมุมเริ่มต้น">
              <RotateCcw size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
