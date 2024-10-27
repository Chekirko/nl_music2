import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Теги  |  Нова пісня",
  description: "Пошук пісень за доступними тегами",
};
export default function TagPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
