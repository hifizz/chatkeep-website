import type { MetadataRoute } from "next";
import { env } from "~/env";

const STATIC_ROUTES = [
  "",
  "/pricing",
  "/install",
  "/faq",
  "/docs",
  "/blog",
  "/changelog",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.map((path) => ({
    url: `${env.BETTER_AUTH_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
