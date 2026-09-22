import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#226548",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "3px solid #f7f8f5",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 13,
            height: 13,
            background: "#f7f8f5",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>,
    size,
  );
}
