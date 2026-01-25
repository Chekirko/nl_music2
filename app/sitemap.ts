import { MetadataRoute } from "next";
import { connectToDB } from "@/utils/database";
import Song from "@/models/song";
import Team from "@/models/teams";

const siteUrl = "https://nl-worship.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/songs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/teams`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/login-page`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/signup-page`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic song pages
  let songPages: MetadataRoute.Sitemap = [];
  try {
    await connectToDB();
    const songs = await Song.find({}).select("_id").lean();
    songPages = songs.map((song: any) => ({
      url: `${siteUrl}/songs/${song._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to fetch songs for sitemap:", error);
  }

  // Dynamic team pages
  let teamPages: MetadataRoute.Sitemap = [];
  try {
    await connectToDB();
    const teams = await Team.find({}).select("_id").lean();
    teamPages = teams.map((team: any) => ({
      url: `${siteUrl}/teams/${team._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error("Failed to fetch teams for sitemap:", error);
  }

  return [...staticPages, ...songPages, ...teamPages];
}
