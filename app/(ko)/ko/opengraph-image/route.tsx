import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
const size = { width: 1200, height: 630 };
export const dynamic = "force-static";
export async function GET() {
  const font = await readFile(
    path.join(process.cwd(), "public/fonts/noto-sans-kr-social.otf"),
  );
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
        fontFamily: "Noto Korean",
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
          fontSize: 70,
          letterSpacing: -2,
          lineHeight: 1.3,
        }}
      >
        <span>모든 판단을,</span>
        <span style={{ color: "#226548" }}>한눈에 선명하게.</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 25,
          marginTop: 35,
          color: "#59625c",
        }}
      >
        로컬에서 살펴보는 AI의 판단 · MIT 라이선스
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
    {
      ...size,
      fonts: [
        { name: "Noto Korean", data: font, style: "normal", weight: 400 },
      ],
    },
  );
}
