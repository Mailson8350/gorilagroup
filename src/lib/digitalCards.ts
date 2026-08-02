export type DigitalCardProfile = {
  slug: string;
  name: string;
  title: string;
  company: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  linkedin?: string;
  photo: string;
};

export const digitalCardProfiles: Record<string, DigitalCardProfile> = {
  carlos: {
    slug: "carlos",
    name: "Carlos Pereira",
    title: "CEO",
    company: "Grupo Gorila Holding",
    description:
      "Executivo com visão estratégica para expansão internacional, inovação e criação de valor em ambientes corporativos de alto impacto.",
    phone: "+351 910 000 000",
    email: "carlos@grupogorila.com",
    website: "https://www.grupogorila.com",
    whatsapp: "+351910000000",
    linkedin: "https://www.linkedin.com",
    photo: "/carlos-ceo.svg",
  },
};

export function getDigitalCardProfile(slug?: string): DigitalCardProfile | undefined {
  if (!slug) return undefined;
  return digitalCardProfiles[slug.toLowerCase()];
}
