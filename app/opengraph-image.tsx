import { ImageResponse } from "next/og";
export const alt = "Jev Observer: Every decision. In clear view.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#f7f8f5",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "65px 75px",
        color: "#202824",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#226548" }}>
        jev observer
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 72,
          fontSize: 82,
          letterSpacing: -4,
          lineHeight: 1.1,
        }}
      >
        <span>Every decision.</span>
        <span style={{ color: "#226548" }}>In clear view.</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 25,
          marginTop: 35,
          color: "#59625c",
        }}
      >
        Local observability for Jev. MIT licensed. Under your control.
      </div>
      <div
        style={{
          position: "absolute",
          right: 85,
          top: 190,
          width: 245,
          height: 245,
          borderRadius: "50%",
          border: "2px solid #9cbaa8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 175,
            height: 175,
            borderRadius: "50%",
            border: "2px solid #226548",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 75,
              height: 75,
              background: "#226548",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    </div>,
    size,
  );
}
