import { getAllTags } from "@/lib/actions/tagActions";
import TagsPageClient from "./TagsPageClient";

export const dynamic = "force-dynamic";

export default async function AllTagsPage() {
  const tags = await getAllTags();

  return <TagsPageClient tags={tags} />;
}
