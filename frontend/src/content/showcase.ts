/** Bilingual home-page content: what Al Sharq Exhibition offers. */
export type Bi = { en: string; ar: string };

export const showcaseHeading = {
  eyebrow: { en: "What we offer", ar: "ما نقدمه" },
  title: { en: "Furniture, interiors & finishing — under one roof", ar: "أثاث وديكور وتشطيبات — تحت سقف واحد" },
  text: {
    en: "From a single chair to a full villa or office fit-out. Almost everything can be customized to your size, colour and budget.",
    ar: "من كرسي واحد إلى تجهيز فيلا أو مكتب كامل. معظم المنتجات قابلة للتفصيل حسب المقاس واللون والميزانية.",
  },
};

export type Slide = { image: string; eyebrow: Bi; title: Bi; text: Bi; href: string; cta: Bi };

export const banners: Slide[] = [
  {
    image: "/images/scenes/hero-living.webp",
    eyebrow: { en: "House furniture", ar: "أثاث منزلي" },
    title: { en: "Full sofa & bed sets, made to your demand", ar: "طقم كنب وغرف نوم كاملة، حسب طلبك" },
    text: { en: "Single & big sitting jalsa, arm chairs, dining, dressing and coffee tables.", ar: "جلسات فردية وكبيرة، كراسي، طاولات طعام وزينة وقهوة." },
    href: "/shop",
    cta: { en: "Shop furniture", ar: "تسوق الأثاث" },
  },
  {
    image: "/images/home/office.webp",
    eyebrow: { en: "Office furniture", ar: "أثاث مكتبي" },
    title: { en: "Desks, office chairs & meeting tables", ar: "مكاتب وكراسي مكتبية وطاولات اجتماعات" },
    text: { en: "Long, round and custom shapes, built for your workspace.", ar: "أشكال طويلة ودائرية ومخصصة لمساحة عملك." },
    href: "/custom-design",
    cta: { en: "Request a design", ar: "اطلب تصميماً" },
  },
  {
    image: "/images/home/curtains.webp",
    eyebrow: { en: "Curtains & chiffon", ar: "ستائر وشيفون" },
    title: { en: "Curtains for every room, including medical", ar: "ستائر لكل غرفة، بما فيها الطبية" },
    text: { en: "All types, stitching and repairing, plus roller blinds (simple & black-out).", ar: "جميع الأنواع، خياطة وتصليح، وستائر رول سادة وبلاك اوت." },
    href: "/contact",
    cta: { en: "Contact us", ar: "تواصل معنا" },
  },
  {
    image: "/images/home/lights.webp",
    eyebrow: { en: "Lights", ar: "إضاءة" },
    title: { en: "Hanging & ceiling lights", ar: "ثريات وإضاءة سقف" },
    text: { en: "Warm, modern fittings that finish any room.", ar: "تركيبات دافئة وعصرية تكمل أي غرفة." },
    href: "/contact",
    cta: { en: "Contact us", ar: "تواصل معنا" },
  },
  {
    image: "/images/home/floor.webp",
    eyebrow: { en: "Flooring", ar: "أرضيات" },
    title: { en: "SPC & laminated wooden flooring", ar: "أرضيات SPC وخشب لامينيت" },
    text: { en: "Straight and herringbone designs, installed by our team.", ar: "تصاميم مستقيمة وسمكة، يركبها فريقنا." },
    href: "/contact",
    cta: { en: "Get a quote", ar: "اطلب عرض سعر" },
  },
];

export const services: { image: string; title: Bi; text: Bi; href: string }[] = [
  {
    image: "/images/scenes/hero-living.webp",
    title: { en: "House furniture", ar: "أثاث منزلي" },
    text: { en: "Full bed sets, full sofa sets, arm chairs, arm-less chairs, single & big sitting jalsa, and all tables: dining, dressing, coffee and more. Customized to your demand.", ar: "غرف نوم كاملة، أطقم كنب كاملة، كراسي بذراعين وبدون، جلسات جلسة فردية وكبيرة، وجميع أنواع الطاولات: طعام، زينة، قهوة وغيرها. حسب طلبك." },
    href: "/shop",
  },
  {
    image: "/images/home/office.webp",
    title: { en: "Office furniture", ar: "أثاث مكتبي" },
    text: { en: "Office chairs, computer tables, desks, and meeting tables & chairs in all shapes, including long and round. Customized to your demand.", ar: "كراسي مكتبية، طاولات كمبيوتر، مكاتب، وطاولات وكراسي اجتماعات بجميع الأشكال، بما فيها الطويلة والدائرية. حسب طلبك." },
    href: "/custom-design",
  },
  {
    image: "/images/home/shelves.webp",
    title: { en: "Bookshelves & wardrobes", ar: "مكتبات وخزائن ملابس" },
    text: { en: "Book shelves and almirah / wardrobes, built to fit your space.", ar: "مكتبات وخزائن ملابس (ألماري)، مصممة لتناسب مساحتك." },
    href: "/custom-design",
  },
  {
    image: "/images/home/kitchen.webp",
    title: { en: "Kitchen cabinets", ar: "خزائن مطبخ" },
    text: { en: "Kitchen cabinets and all kinds of kitchen fittings.", ar: "خزائن مطبخ وجميع أنواع تركيبات المطبخ." },
    href: "/custom-design",
  },
  {
    image: "/images/products/sof-velvet-3-1.webp",
    title: { en: "Used & refurbished furniture", ar: "أثاث مستعمل ومجدد" },
    text: { en: "Used and refurbished furniture of all types, for house and office.", ar: "أثاث مستعمل ومجدد من جميع الأنواع، للمنزل والمكتب." },
    href: "/contact",
  },
  {
    image: "/images/home/curtains.webp",
    title: { en: "Curtains & chiffon", ar: "ستائر وشيفون" },
    text: { en: "All types of curtains and chiffon, stitching and repairing, and medical curtains.", ar: "جميع أنواع الستائر والشيفون، خياطة وتصليح، وستائر طبية." },
    href: "/contact",
  },
  {
    image: "/images/home/blinds.webp",
    title: { en: "Roller blinds", ar: "ستائر رول" },
    text: { en: "Simple and black-out roller blinds.", ar: "ستائر رول سادة وبلاك اوت." },
    href: "/contact",
  },
  {
    image: "/images/home/wallpaper.webp",
    title: { en: "Wallpapers", ar: "ورق جدران" },
    text: { en: "Ready-made wallpapers for walls, and customized wallpaper designs.", ar: "ورق جدران جاهز، وتصاميم مخصصة حسب الطلب." },
    href: "/contact",
  },
  {
    image: "/images/home/panel.webp",
    title: { en: "Wall paneling", ar: "تكسيات جدران" },
    text: { en: "All types of wall paneling for homes and offices.", ar: "جميع أنواع تكسية الجدران للمنازل والمكاتب." },
    href: "/contact",
  },
  {
    image: "/images/home/floor.webp",
    title: { en: "SPC Parquet flooring", ar: "باركيه SPC" },
    text: { en: "SPC Parquet in straight and herringbone patterns.", ar: "باركيه SPC بتصميم مستقيم وسمكة (هيرينغبون)." },
    href: "/contact",
  },
  {
    image: "/images/home/floor.webp",
    title: { en: "Laminated wooden flooring", ar: "أرضيات خشب لامينيت" },
    text: { en: "Laminated wooden flooring for any room.", ar: "أرضيات خشب لامينيت لأي غرفة." },
    href: "/contact",
  },
  {
    image: "/images/home/lights.webp",
    title: { en: "Hanging & ceiling lights", ar: "ثريات وإضاءة سقف" },
    text: { en: "Hanging and ceiling lights for every room.", ar: "ثريات وإضاءة سقف لكل غرفة." },
    href: "/contact",
  },
  {
    image: "/images/home/doors.webp",
    title: { en: "Fiber & wooden doors", ar: "أبواب فايبر وخشب" },
    text: { en: "Simple and folding doors, in fiber and wood.", ar: "أبواب سادة وقابلة للطي، من الفايبر والخشب." },
    href: "/contact",
  },
];

/** "Made to order" steps shown beside the custom-design block. */
export const customSteps: { title: Bi; text: Bi }[] = [
  { title: { en: "Share your idea", ar: "شاركنا فكرتك" }, text: { en: "Send a sketch, a photo, or simply describe the room.", ar: "أرسل رسمة أو صورة، أو صف المكان ببساطة." } },
  { title: { en: "We measure & design", ar: "نقيس ونصمم" }, text: { en: "Our team visits, measures and sends you a clear plan.", ar: "يزور فريقنا المكان ويأخذ القياسات ويرسل لك مخططاً واضحاً." } },
  { title: { en: "We build & deliver", ar: "نصنع ونوصل" }, text: { en: "Crafted in our workshop and installed at your home or office.", ar: "نصنعه في ورشتنا ونركبه في منزلك أو مكتبك." } },
];

/** Home page FAQ. */
export const faqHeading = {
  eyebrow: { en: "FAQ", ar: "الأسئلة الشائعة" },
  title: { en: "Questions customers ask us", ar: "أسئلة يسألها عملاؤنا" },
};

export const faqs: { q: Bi; a: Bi }[] = [
  { q: { en: "How long does delivery take?", ar: "كم تستغرق مدة التوصيل؟" }, a: { en: "Ready stock is usually delivered across Qatar within a few days. Custom pieces start production once you approve the quote.", ar: "المنتجات الجاهزة توصل عادة خلال أيام قليلة في جميع أنحاء قطر. تبدأ المنتجات المخصصة بالتصنيع بعد موافقتك على عرض السعر." } },
  { q: { en: "Is delivery free?", ar: "هل التوصيل مجاني؟" }, a: { en: "Yes, delivery is free on orders over QAR 2,000.", ar: "نعم، التوصيل مجاني للطلبات التي تزيد عن 2,000 ريال قطري." } },
  { q: { en: "How can I pay?", ar: "كيف يمكنني الدفع؟" }, a: { en: "Cash on delivery, or bank transfer. Our bank details are shown at checkout.", ar: "الدفع عند الاستلام، أو تحويل بنكي. تظهر بيانات الحساب البنكي عند إتمام الطلب." } },
  { q: { en: "How do custom orders work?", ar: "كيف تعمل الطلبات المخصصة؟" }, a: { en: "Share a sketch, a photo or the room measurements. Our team visits, measures and sends a quote within 2 days. After you approve, we build and install.", ar: "أرسل رسمة أو صورة أو قياسات المكان. يزور فريقنا المكان ويأخذ القياسات ويرسل عرض السعر خلال يومين. بعد موافقتك نصنع المنتج ونركبه." } },
  { q: { en: "What warranty do you give?", ar: "ما هو الضمان الذي تقدمونه؟" }, a: { en: "Our furniture comes with a 5-year frame warranty.", ar: "تأتي أثاثاتنا بضمان هيكل لمدة 5 سنوات." } },
  { q: { en: "Can I visit the showroom?", ar: "هل يمكنني زيارة المعرض؟" }, a: { en: "Yes. We are on Salwa Road, near Teyseer Petrol Station, Doha. We are open Saturday to Thursday and closed on Friday.", ar: "نعم. نقع في طريق سلوى بالقرب من محطة تيسير للبترول، الدوحة. نفتح من السبت إلى الخميس ونغلق يوم الجمعة." } },
  { q: { en: "Do you do repairs?", ar: "هل تقدمون خدمات التصليح؟" }, a: { en: "Yes. We repair and re-upholster furniture, and we stitch and repair curtains.", ar: "نعم. نصلح الأثاث ونعيد تنجيده، ونخيط الستائر ونصلحها." } },
];

/** About page: showroom and workshop slides. */
export const aboutSlides: Slide[] = [
  {
    image: "/images/scenes/living-wide.webp",
    eyebrow: { en: "Our showroom", ar: "معرضنا" },
    title: { en: "Come see it in person", ar: "تعال وشاهده بنفسك" },
    text: { en: "Touch the fabrics, sit on the sofas and see the colours in daylight.", ar: "المس الأقمشة واجلس على الكنب وشاهد الألوان في ضوء النهار." },
    href: "/contact",
    cta: { en: "Find us", ar: "موقعنا" },
  },
  {
    image: "/images/scenes/dining.webp",
    eyebrow: { en: "Our craft", ar: "حرفتنا" },
    title: { en: "Made with care, built to last", ar: "مصنوع بعناية ومبني ليدوم" },
    text: { en: "Kiln-dried hardwood, real leather and natural fibres, finished by hand.", ar: "خشب صلب مجفف في الفرن، جلد طبيعي وألياف طبيعية، وتشطيب يدوي." },
    href: "/shop",
    cta: { en: "See the collection", ar: "شاهد المجموعة" },
  },
  {
    image: "/images/home/shelves.webp",
    eyebrow: { en: "Our range", ar: "مجموعاتنا" },
    title: { en: "Everything for your home and office", ar: "كل ما تحتاجه لمنزلك ومكتبك" },
    text: { en: "Furniture, curtains, flooring, lights and doors, customized to your space.", ar: "أثاث وستائر وأرضيات وإضاءة وأبواب، مفصلة حسب مساحتك." },
    href: "/custom-design",
    cta: { en: "Request a design", ar: "اطلب تصميماً" },
  },
];

/** About page gallery: real scenes from our range. */
export const gallery: { image: string; label: Bi }[] = [
  { image: "/images/home/kitchen.webp", label: { en: "Kitchen cabinets", ar: "خزائن مطبخ" } },
  { image: "/images/home/curtains.webp", label: { en: "Curtains & chiffon", ar: "ستائر وشيفون" } },
  { image: "/images/home/floor.webp", label: { en: "SPC & laminated flooring", ar: "أرضيات SPC ولامينيت" } },
  { image: "/images/home/lights.webp", label: { en: "Hanging & ceiling lights", ar: "ثريات وإضاءة سقف" } },
  { image: "/images/home/panel.webp", label: { en: "Wall paneling", ar: "تكسيات جدران" } },
  { image: "/images/home/doors.webp", label: { en: "Fiber & wooden doors", ar: "أبواب فايبر وخشب" } },
];
