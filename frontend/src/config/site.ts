export const siteConfig = {
  name: "Al Sharq Exhibition",
  nameAr: "معرض الشرق",
  legalName: "Al Sharq Exhibition",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+974 3399 2201", // mobile & WhatsApp
  landline: "+974 4442 2906",
  whatsapp: "https://wa.me/97433992201",
  address: {
    en: "7F5P+2V6, Salwa Road, near Teyseer Petrol Station, Doha, Qatar",
    ar: "7F5P+2V6، طريق سلوى، بالقرب من محطة تيسير للبترول، الدوحة، قطر",
  },
  mapUrl: "https://www.google.com/maps/search/?api=1&query=7F5P%2B2V6%20Doha%20Qatar",
  hours: {
    en: ["Sat – Thu: 8:00 AM – 1:00 PM, 4:00 PM – 9:00 PM", "Friday: Closed"],
    ar: ["السبت – الخميس: 8:00 ص – 1:00 م، 4:00 م – 9:00 م", "الجمعة: مغلق"],
  },
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "TikTok", href: "https://tiktok.com" },
  ],
} as const;

export const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
