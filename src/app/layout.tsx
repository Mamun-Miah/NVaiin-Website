import type { Metadata } from "next";
import { Anton, Bebas_Neue, Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/components/shop/CartDrawer";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono-brand",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "N'VAIIN — Not Made In Vain",
  description:
    "N'VAIIN is a revolutionary clothing line with a purpose beyond fashion. Born from the belief that style should be a reflection of values. Not Made In Vain.",
  keywords: [
    "N'VAIIN",
    "streetwear",
    "conscious fashion",
    "luxury streetwear",
    "limited drops",
  ],
  icons: {
    icon: "https://www.nvaiin.com/cdn/shop/files/Happy_N_Vaiin_23_x_19_in_11.png?v=1701494400",
  },
  openGraph: {
    title: "N'VAIIN — Not Made In Vain",
    description:
      "Conscious Fashion. Timeless Style. Born 02/22/2023 — 2:22PM.",
    siteName: "N'VAIIN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anton.variable} ${bebas.variable} ${spaceMono.variable} ${syne.variable} antialiased bg-nv-black text-nv-white`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <GrainOverlay />
          <CustomCursor />
        </Providers>
      </body>
    </html>
  );
}
