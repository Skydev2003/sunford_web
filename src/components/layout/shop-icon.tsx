import Image from "next/image";

export function ShopIcon() {
  return (
    <picture
      style={{ position: "relative", display: "block", width: 20, height: 20, flex: "none" }}
    >
      <source
        media="(prefers-reduced-motion: reduce)"
        srcSet="/images/navigation/shopping-loader-still.png"
      />
      <Image
        src="/images/navigation/shopping-loader.svg"
        alt=""
        width={36}
        height={36}
        loading="eager"
        unoptimized
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "none",
          pointerEvents: "none",
        }}
      />
    </picture>
  );
}
