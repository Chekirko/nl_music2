"use client";

import { useRouter } from "next/navigation";
import { TagBadge } from "@/components/tags";

interface Tag {
  _id: string;
  name: string;
  songsCount: number;
}

interface TagsPageClientProps {
  tags: Tag[];
}

const TagsPageClient = ({ tags }: TagsPageClientProps) => {
  const router = useRouter();

  return (
    <div className="max-w-[1600px] mx-auto flex flex-start gap-4 padding-x">
      <section className="w-full max-w-full flex-start flex-col">
        <h1 className="head_text text-left">
          <span className="blue_gradient">Доступні теги</span>
        </h1>
        <p className="desc text-left max-w-md mb-16">
          Шукай пісню за потрібним ключовим словом:
        </p>

        <div className="flex gap-3 flex-wrap">
          {tags.length === 0 ? (
            <p className="text-gray-500">Тегів поки немає</p>
          ) : (
            tags.map((tag) => (
              <div key={tag._id} className="flex items-center gap-2">
                <TagBadge
                  name={tag.name}
                  onClick={() =>
                    router.push(`/songs/tags/${tag.name}?forwardedTag=${tag.name}`)
                  }
                />
                <span className="text-sm text-gray-500">({tag.songsCount})</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default TagsPageClient;
