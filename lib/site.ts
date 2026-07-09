export const site = {
  name: "Camel Cement",
  tagline: "We Build Stronger",
  group: "Amsons Group",
  brandRelationship: "A member of Amsons Group",
  positioning: "The Engineer's Choice",
  phone: "+255 788 026 188",
  phoneHref: "tel:+255788026188",
  salesEmail: "sales.cement@amsonsgroup.net",
  generalEmail: "info@amsonsgroup.net",
  postal: "P.O. Box 22786, Dar es Salaam, Tanzania",
  address: "Mbagala Industrial Area, Kilwa Road, Dar es Salaam, Tanzania",
  announcement: "Engineered for strength. Part of Amsons Group.",
  utilityBar:
    "ISO 9001:2015 Certified | Four Specialised Cement Grades | Sales: +255 788 026 188",
  instagram: "https://www.instagram.com/camel_cement/",
  instagramHandle: "@camel_cement",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Calculator", href: "/calculator" },
  { label: "Quality", href: "/quality" },
  { label: "Projects", href: "/projects" },
  { label: "Resources", href: "/resources" },
  { label: "News", href: "/news" },
];

export const fullNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Cement Calculator", href: "/calculator" },
  { label: "Quality", href: "/quality" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Projects", href: "/projects" },
  { label: "Resources", href: "/resources" },
  { label: "News", href: "/news" },
  { label: "Media Gallery", href: "/gallery" },
  { label: "Cart", href: "/cart" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export const groupLogos = [
  { src: "/logos/camel-concrete-logo.png", alt: "Camel Concrete" },
  { src: "/logos/camel-oil-logo.png", alt: "Camel Oil" },
  { src: "/logos/cam-gas-logo.png", alt: "Cam Gas" },
  { src: "/logos/camel-flour-logo.png", alt: "Camel Flour" },
  { src: "/logos/camel-lubricants-logo.png", alt: "Camel Lubricants" },
  { src: "/logos/camel-packaging-logo.png", alt: "Camel Packaging" },
  { src: "/logos/kalahari-petroleum-logo.png", alt: "Kalahari Petroleum" },
  { src: "/logos/mbeya-cement-logo.png", alt: "Mbeya Cement" },
  { src: "/logos/bamburi-cement-logo.png", alt: "Bamburi Cement" },
];

export const regions = [
  "Arusha",
  "Dar es Salaam",
  "Dodoma",
  "Geita",
  "Iringa",
  "Kagera",
  "Katavi",
  "Kigoma",
  "Kilimanjaro",
  "Lindi",
  "Manyara",
  "Mara",
  "Mbeya",
  "Morogoro",
  "Mtwara",
  "Mwanza",
  "Njombe",
  "Pemba North",
  "Pemba South",
  "Pwani",
  "Rukwa",
  "Ruvuma",
  "Shinyanga",
  "Simiyu",
  "Singida",
  "Songwe",
  "Tabora",
  "Tanga",
  "Unguja North",
  "Unguja South",
  "Zanzibar Urban West",
];
