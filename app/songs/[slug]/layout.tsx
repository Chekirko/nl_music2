import type { Metadata } from "next";
import { getSongById } from "@/lib/actions/songActions";

type SingleSongPageProps = { params: { slug: string } };
export async function generateMetadata({ params }: SingleSongPageProps): Promise<Metadata> {
  try {
    const song = await getSongById(params.slug);
    return { title: song?.title };
  } catch {
    return { title: "Пісня" };
  }
}

export default function SingleSongPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
