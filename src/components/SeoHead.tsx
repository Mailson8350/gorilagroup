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

    // Twitter card defaults
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", siteConfig.twitter_title || pageTitle);
    setMeta("twitter:description", siteConfig.twitter_description || siteConfig.seo_description || "");
    const twImg = mediaUrl(siteConfig.twitter_image || siteConfig.og_image || siteConfig.logo_url);
    if (twImg) setMeta("twitter:image", twImg);

    // Canonical link
    if (siteConfig.site_url) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = siteConfig.site_url;
    }

    // JSON-LD Organization
    try {
      const ldId = "site-jsonld";
      let script = document.getElementById(ldId) as HTMLScriptElement | null;
      const origin = siteConfig.site_url || window.location.origin;
      const sameAs: string[] = [];
      if (siteConfig.social_instagram) sameAs.push(siteConfig.social_instagram);
      if (siteConfig.social_facebook) sameAs.push(siteConfig.social_facebook);
      if (siteConfig.social_twitter) sameAs.push(siteConfig.social_twitter);
      if (siteConfig.social_youtube) sameAs.push(siteConfig.social_youtube);

      const jsonld = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.site_name || pageTitle,
        url: origin,
        logo: mediaUrl(siteConfig.logo_url) || undefined,
        sameAs: sameAs.length ? sameAs : undefined,
      } as Record<string, unknown>;

      if (!script) {
        script = document.createElement("script");
        script.id = ldId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonld);
    } catch (e) {
      // ignore
    }

    // Analytics (Google Analytics v4) when consent is given.
    const loadAnalyticsIfAllowed = () => {
      try {
        const consent = localStorage.getItem("cookieConsent");
        const gid = (globalThis as any)?.VITE_GA_MEASUREMENT_ID || (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || siteConfig.analytics_id;
        if (consent === "1" && gid) {
          if (!document.querySelector(`script[data-ga="${gid}"]`)) {
            const s = document.createElement("script");
            s.setAttribute("data-ga", String(gid));
            s.async = true;
            s.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
            document.head.appendChild(s);

            const inline = document.createElement("script");
            inline.text = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gid}', { send_page_view: true });`;
            document.head.appendChild(inline);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    loadAnalyticsIfAllowed();
    window.addEventListener("cookieConsentChanged", loadAnalyticsIfAllowed);
    return () => window.removeEventListener("cookieConsentChanged", loadAnalyticsIfAllowed);
  }, [siteConfig, title]);

  return null;
}
