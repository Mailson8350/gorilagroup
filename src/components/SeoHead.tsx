import { useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { mediaUrl } from "../lib/media";

/** Atualiza meta tags e título a partir das configurações do site. */
export default function SeoHead({ title }: { title?: string }) {
  const { siteConfig } = useSettings();

  useEffect(() => {
    const pageTitle = title || siteConfig.seo_title || siteConfig.site_name || "Gorila";
    document.title = pageTitle;

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", siteConfig.seo_description);
    setMeta("keywords", siteConfig.seo_keywords);
    setMeta("og:title", siteConfig.og_title || pageTitle, "property");
    setMeta("og:description", siteConfig.og_description || siteConfig.seo_description, "property");
    const ogImg = mediaUrl(siteConfig.og_image || siteConfig.logo_url);
    if (ogImg) setMeta("og:image", ogImg, "property");

    const fav = mediaUrl(siteConfig.favicon_url);
    if (fav) {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = fav;
    }
  }, [siteConfig, title]);

  return null;
}
