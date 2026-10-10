import type { Metadata } from "next";
import { Lora, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { BgmPlayer } from "./components/BgmPlayer";

const lora = Lora({
  variable: "--font-serif",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

const siteUrlString =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vietmix.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrlString),
  title: {
    default: "Việt phục Remix - Phối đồ Việt phục",
    template: "%s | Việt phục Remix",
  },
  description:
    "Khám phá và trải nghiệm phối trang phục truyền thống Việt Nam (Áo ngũ thân, Giao lĩnh, Nhật bình) cùng các nét chấm phá hiện đại.",
  keywords: [
    "Việt phục",
    "Cổ phục",
    "Áo ngũ thân",
    "Áo giao lĩnh",
    "Áo nhật bình",
    "Việt phục Remix",
    "Thời trang Gen Z",
  ],
  openGraph: {
    title: "Việt phục Remix - Phối đồ Việt phục",
    description:
      "Khám phá và trải nghiệm phối trang phục truyền thống Việt Nam cùng các nét chấm phá hiện đại.",
    url: siteUrlString,
    siteName: "Việt phục Remix",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Việt phục Remix - Phối đồ Việt phục",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Việt phục Remix - Phối đồ Việt phục",
    description:
      "Khám phá và trải nghiệm phối trang phục truyền thống Việt Nam cùng các nét chấm phá hiện đại.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${lora.variable} ${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-cream)] text-[var(--ink-text)]">
        {children}
        <BgmPlayer />
      </body>
    </html>
  );
}
