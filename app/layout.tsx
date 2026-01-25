import { Footer, Navbar, Providers } from "@/components";
import "./globals.css";
import type { Metadata } from "next";

const siteUrl = "https://nl-worship.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NL Songs — Пісні прославлення",
    template: "%s | NL Songs",
  },
  description: "Збірник пісень прославлення церкви Нове життя. Акорди, тексти, події та команди.",
  keywords: ["пісні прославлення", "акорди", "християнські пісні", "worship", "церква", "Нове життя"],
  authors: [{ name: "Нове життя" }],
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: siteUrl,
    siteName: "NL Songs",
    title: "NL Songs — Пісні прославлення",
    description: "Збірник пісень прославлення церкви Нове життя",
  },
  twitter: {
    card: "summary_large_image",
    title: "NL Songs — Пісні прославлення",
    description: "Збірник пісень прославлення церкви Нове життя",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="relative min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-grow min-h-[50vh] pb-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
