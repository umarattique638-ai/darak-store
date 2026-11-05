export const siteConfig = {
  name: "Darak",
  legalName: "Darak Living",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@darak.qa",
  phone: "+974 4000 0000",
  whatsapp: "https://wa.me/97440000000",
  address: { en: "Lusail Boulevard, Doha, Qatar", ar: "بوليفارد لوسيل، الدوحة، قطر" },
  hours: { en: "Sat – Thu · 10:00 – 22:00", ar: "السبت – الخميس · 10:00 – 22:00" },
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "TikTok", href: "https://tiktok.com" },
  ],
} as const;
