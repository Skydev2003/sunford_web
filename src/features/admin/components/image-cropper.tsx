"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ImageGuideline } from "../image-guidelines";

type Pending = {
  file: File;
  url: string;
  preset: ImageGuideline;
  resolve: (file: File | null) => void;
};

export function useImageCropper() {
  const [pending, setPending] = useState<Pending | null>(null);
  const current = useRef<Pending | null>(null);
  useEffect(
    () => () => {
      if (current.current) {
        URL.revokeObjectURL(current.current.url);
        current.current.resolve(null);
      }
    },
    [],
  );
  function finish(file: File | null) {
    if (!current.current) return;
    URL.revokeObjectURL(current.current.url);
    current.current.resolve(file);
    current.current = null;
    setPending(null);
  }
  function crop(file: File, preset: ImageGuideline) {
    return new Promise<File | null>((resolve) => {
      const next = { file, preset, resolve, url: URL.createObjectURL(file) };
      current.current = next;
      setPending(next);
    });
  }
  return {
    crop,
    cropper:
      pending &&
      createPortal(
        <ImageCropper key={pending.url} pending={pending} onFinish={finish} />,
        document.querySelector(".admin-app") ?? document.body,
      ),
  };
}

function ImageCropper({
  pending,
  onFinish,
}: {
  pending: Pending;
  onFinish: (file: File | null) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState("original");
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [error, setError] = useState("");
  const [encoding, setEncoding] = useState(false);
  const ratio =
    aspect === "original" ? (image ? image.naturalWidth / image.naturalHeight : 1) : Number(aspect);
  const cropWidth = image ? Math.min(image.naturalWidth, image.naturalHeight * ratio) / zoom : 1;
  const cropHeight = cropWidth / ratio;
  const sx = image ? ((image.naturalWidth - cropWidth) * x) / 100 : 0;
  const sy = image ? ((image.naturalHeight - cropHeight) * y) / 100 : 0;
  useEffect(() => {
    dialog.current?.showModal();
    const picture = new Image();
    picture.onload = () => {
      if (picture.naturalWidth * picture.naturalHeight > 40000000)
        setError("รูปมีความละเอียดสูงเกินไป กรุณาลดให้ไม่เกิน 40 ล้านพิกเซล");
      else setImage(picture);
    };
    picture.onerror = () =>
      setError("ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP ที่เปิดได้ กรุณาเลือกรูปใหม่");
    picture.src = pending.url;
    return () => {
      picture.onload = null;
      picture.onerror = null;
    };
  }, [pending.url]);
  useEffect(() => {
    if (!image || !canvas.current) return;
    const target = canvas.current;
    const scale = Math.min(1, 900 / cropWidth, 500 / cropHeight);
    target.width = Math.max(1, Math.round(cropWidth * scale));
    target.height = Math.max(1, Math.round(cropHeight * scale));
    target
      .getContext("2d")
      ?.drawImage(image, sx, sy, cropWidth, cropHeight, 0, 0, target.width, target.height);
  }, [image, sx, sy, cropWidth, cropHeight]);
  async function confirm() {
    if (!image) return;
    setEncoding(true);
    setError("");
    try {
      const output = document.createElement("canvas");
      const scale = Math.min(1, 2048 / cropWidth, 2048 / cropHeight);
      output.width = Math.max(1, Math.round(cropWidth * scale));
      output.height = Math.max(1, Math.round(cropHeight * scale));
      const context = output.getContext("2d");
      if (!context) throw new Error();
      context.drawImage(image, sx, sy, cropWidth, cropHeight, 0, 0, output.width, output.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        output.toBlob(resolve, "image/webp", 0.9),
      );
      if (!blob || blob.size > 4 * 1024 * 1024) throw new Error();
      onFinish(
        new File([blob], `${pending.file.name.replace(/\.[^.]+$/, "")}-crop.webp`, {
          type: "image/webp",
        }),
      );
    } catch {
      setError("สร้างภาพไม่สำเร็จหรือไฟล์เกิน 4 MB กรุณาเลือกกรอบใหม่หรือลดขนาดรูป");
      setEncoding(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="admin-crop-dialog admin-app"
      aria-labelledby="crop-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!encoding) onFinish(null);
      }}
    >
      <h2 id="crop-title">ตัดภาพก่อนอัปโหลด</h2>
      <p>
        {pending.preset.label} · แนะนำ {pending.preset.width} × {pending.preset.height} พิกเซล
      </p>
      <div className="admin-crop-canvas">
        <canvas ref={canvas} aria-label="ตัวอย่างกรอบภาพที่จะใช้" />
      </div>
      {image && (
        <small>
          ต้นฉบับ {image.naturalWidth} × {image.naturalHeight} พิกเซล · กรอบที่เลือก{" "}
          {Math.round(cropWidth)} × {Math.round(cropHeight)} พิกเซล
          {cropWidth < pending.preset.width || cropHeight < pending.preset.height
            ? " · ความละเอียดต่ำกว่าที่แนะนำ"
            : ""}
        </small>
      )}
      <fieldset disabled={!image || encoding} className="admin-crop-controls">
        <label>
          สัดส่วนภาพ
          <select
            aria-label="สัดส่วนภาพ"
            value={aspect}
            onChange={(event) => {
              setAspect(event.target.value);
              setZoom(1);
              setX(50);
              setY(50);
            }}
          >
            <option value="original">สัดส่วนต้นฉบับ</option>
            <option value={String(pending.preset.width / pending.preset.height)}>
              สัดส่วนแนะนำ {pending.preset.width}:{pending.preset.height}
            </option>
            <option value="1">สี่เหลี่ยมจัตุรัส 1:1</option>
            <option value={String(16 / 9)}>แนวนอน 16:9</option>
            <option value={String(4 / 3)}>แนวนอน 4:3</option>
          </select>
        </label>
        <label>
          ขยายภาพ
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <label>
          ตำแหน่งแนวนอน
          <input
            type="range"
            min="0"
            max="100"
            value={x}
            onChange={(event) => setX(Number(event.target.value))}
          />
        </label>
        <label>
          ตำแหน่งแนวตั้ง
          <input
            type="range"
            min="0"
            max="100"
            value={y}
            onChange={(event) => setY(Number(event.target.value))}
          />
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="admin-field-error">
          {error}
        </p>
      )}
      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-button-secondary"
          disabled={encoding}
          onClick={() => onFinish(null)}
        >
          ยกเลิกการเลือกรูป
        </button>
        <button
          type="button"
          className="admin-button-secondary"
          disabled={!image || encoding}
          onClick={() => onFinish(pending.file)}
        >
          ใช้รูปต้นฉบับ
        </button>
        <button
          type="button"
          className="button button-red"
          disabled={!image || encoding}
          onClick={confirm}
        >
          {encoding ? "กำลังสร้างภาพ…" : "ใช้ภาพที่ตัด"}
        </button>
      </div>
    </dialog>
  );
}
