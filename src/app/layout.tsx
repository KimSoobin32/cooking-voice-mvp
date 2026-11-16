import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "손안의 셰프 - 핸즈프리 요리 레시피 가이드",
  description: "요리 초보 자취생을 위한 단계별 음성 및 터치리스 제스처 기반 모바일 웹 레시피",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "손안의 셰프",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="bg-stone-100 min-h-screen text-stone-900 antialiased flex flex-col items-center justify-center">
        <main className="mobile-container overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
