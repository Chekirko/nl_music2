import type { Metadata, ResolvingMetadata } from "next";
import { SingleSongPageProps } from "./page";
export async function generateMetadata(
  { params }: SingleSongPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const response = await fetch(
    new URL(
      `/api/songs/single?id=${params.slug}`,
      process.env.NEXT_PUBLIC_BASE_URL
    ).toString(),
    {
      next: { revalidate: 60 },
    }
  );

  const song = await response.json();
  return {
    title: song?.title,
  };
}

export default function SingleSongPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
