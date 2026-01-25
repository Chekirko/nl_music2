import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://nl-worship.com";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/denied", "/profile"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
