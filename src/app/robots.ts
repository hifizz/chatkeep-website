import type { MetadataRoute } from "next";
import { env } from "~/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/s/"],
      },
    ],
    sitemap: `${env.BETTER_AUTH_URL}/sitemap.xml`,
  };
}
