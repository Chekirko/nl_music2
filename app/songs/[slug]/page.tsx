import type { Metadata } from "next";
import { getSongById, getSongCopyContext } from "@/lib/actions/songActions";
import SingleSongClient from "@/components/SingleSongClient";
import { canDeleteSong, canEditSong } from "@/lib/permissions";
import Script from "next/script";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const song = await getSongById(params.slug);
    // Extract more text for better SEO
    const allLyrics = song.blocks
      ?.filter((b) => b.name && b.lines)
      .map((b) => b.lines)
      .join(" ")
      .substring(0, 300) || "";
    return {
      title: song.title,
      description: `${song.title} — акорди та текст пісні${song.key ? ` в тональності ${song.key}` : ""}. ${allLyrics}...`,
      openGraph: {
        title: `${song.title} — акорди та текст`,
        description: `Пісня прославлення "${song.title}"${song.teamName ? ` від команди ${song.teamName}` : ""}. ${allLyrics.substring(0, 150)}...`,
      },
    };
  } catch {
    return {
      title: "Пісня",
      description: "Пісня прославлення з акордами та текстом",
    };
  }
}

const SingleSongPage = async ({ params }: PageProps) => {
  const song = await getSongById(params.slug);
  const copyContext = await getSongCopyContext(params.slug);
  const editAccess = await canEditSong(params.slug);
  const deleteAccess = await canDeleteSong(params.slug);

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    name: song.title,
    inLanguage: "uk",
    ...(song.key && { musicalKey: song.key }),
    ...(song.teamName && { 
      composer: {
        "@type": "MusicGroup",
        name: song.teamName,
      }
    }),
    lyrics: {
      "@type": "CreativeWork",
      text: song.blocks
        ?.filter((b) => b.name && b.lines)
        .map((b) => `${b.name}\n${b.lines}`)
        .join("\n\n") || "",
    },
  };

  // Extract plain text lyrics for hidden SSR content
  const seoLyrics = song.blocks
    ?.filter((b) => b.name && b.lines)
    .map((b) => ({ name: b.name, lines: b.lines })) || [];

  return (
    <>
      {/* JSON-LD for search engines */}
      <Script
        id="song-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hidden SSR lyrics for search engine indexing */}
      <div className="sr-only" aria-hidden="true">
        <h1>{song.title}</h1>
        {song.key && <p>Тональність: {song.key}</p>}
        {song.teamName && <p>Команда: {song.teamName}</p>}
        {seoLyrics.map((block, i) => (
          <section key={i}>
            <h2>{block.name}</h2>
            <pre>{block.lines}</pre>
          </section>
        ))}
      </div>

      <SingleSongClient
        id={params.slug}
        initialSong={song}
        canEdit={!!editAccess.ok}
        canDelete={!!deleteAccess.ok}
        initialCopyContext={copyContext}
      />
    </>
  );
};

export default SingleSongPage;

