export type ProductGrade = "42.5R" | "42.5N" | "32.5R" | "32.5N";

export interface Product {
  slug: string;
  grade: ProductGrade;
  friendlyName: string;
  eyebrow: string;
  color: string;
  colorClass: string;
  image: string;
  description: string;
  heroBody: string;
  bestFor: string;
  bagSize: string;
  classification: string;
  strengthDevelopment: string;
  workability: string;
  keyFeatures: string[];
  applications: string[];
  whyChoose: string;
  storage: string;
  compareWith: string;
  seoTitle: string;
  seoDescription: string;
}

export const STORAGE_GUIDANCE =
  "Store cement in a dry, covered and well-ventilated place. Keep bags raised above the floor, protected from moisture and away from external walls. Use older stock first and avoid using damaged or hardened bags.";

export const products: Product[] = [
  {
    slug: "42-5r",
    grade: "42.5R",
    friendlyName: "Rapid Strength Cement",
    eyebrow: "RAPID HARDENING",
    color: "#6E2638",
    colorClass: "bg-product-425r",
    image: "/products/42-5r.png",
    description:
      "High early strength and dependable structural performance for demanding construction schedules and applications.",
    heroBody:
      "A high-performance cement developed for construction activities that require dependable early strength, dense concrete and efficient progress on demanding projects.",
    bestFor:
      "Ready-mix concrete, roads, bridges, roof slabs, columns and block production.",
    bagSize: "50 kg",
    classification: "CEM 42.5R (EN 197)",
    strengthDevelopment: "Rapid early strength",
    workability: "Engineered for structural work",
    keyFeatures: [
      "Higher compressive strength",
      "Strong early strength development",
      "Supports dense concrete production",
      "Suitable for lower water-cement ratio applications under an approved mix design",
      "Reliable performance for time-sensitive construction",
    ],
    applications: [
      "Block making",
      "Ready-mix concrete",
      "Roads and bridges",
      "Roof slabs",
      "Structural columns",
      "Precast elements",
      "High-demand infrastructure work",
    ],
    whyChoose:
      "Choose Grade 42.5R for projects where early strength development, efficient construction progress and high structural performance are important. The final mix design, curing process and engineering specification remain essential to the result.",
    storage: STORAGE_GUIDANCE,
    compareWith: "42-5n",
    seoTitle: "Camel Cement 42.5R | Rapid Strength Cement Tanzania",
    seoDescription:
      "Camel Cement 42.5R provides high early strength for ready-mix concrete, blocks, roads, bridges, roof slabs, columns and demanding construction schedules.",
  },
  {
    slug: "42-5n",
    grade: "42.5N",
    friendlyName: "Structural Strength Cement",
    eyebrow: "HIGH STRENGTH",
    color: "#20242A",
    colorClass: "bg-product-425n",
    image: "/products/42-5n.png",
    description:
      "Strong long-term strength development and versatile performance for structural and precast construction.",
    heroBody:
      "A versatile structural cement designed for reliable long-term strength development across concrete, precast and general structural applications.",
    bestFor:
      "Pillars, slabs, walls, precast products, bricks, paving and medium to high-strength concrete.",
    bagSize: "50 kg",
    classification: "CEM 42.5N (EN 197)",
    strengthDevelopment: "Normal early strength, strong long-term",
    workability: "Versatile structural performance",
    keyFeatures: [
      "Strong long-term strength development",
      "Versatile structural performance",
      "Suitable for medium and high-strength concrete under approved designs",
      "Dependable for precast production",
      "Consistent results across a wide range of applications",
    ],
    applications: [
      "Pillars and columns",
      "Concrete slabs",
      "Structural walls",
      "Precast products",
      "Bricks and blocks",
      "Paving products",
      "Medium and high-strength concrete",
    ],
    whyChoose:
      "Choose Grade 42.5N when the project requires dependable structural strength, versatility and consistent long-term performance without a specific rapid-hardening requirement.",
    storage: STORAGE_GUIDANCE,
    compareWith: "42-5r",
    seoTitle: "Camel Cement 42.5N | Structural Strength Cement Tanzania",
    seoDescription:
      "Camel Cement 42.5N delivers strong long-term strength for pillars, slabs, walls, precast products, paving, bricks and structural concrete.",
  },
  {
    slug: "32-5r",
    grade: "32.5R",
    friendlyName: "All-Purpose Cement",
    eyebrow: "ALL-PURPOSE",
    color: "#C82D32",
    colorClass: "bg-product-325r",
    image: "/products/32-5r.png",
    description:
      "Consistent, durable and economical performance for a wide range of everyday building activities.",
    heroBody:
      "A practical and dependable cement for a wide range of everyday building activities, offering consistent results, durability and economical performance.",
    bestFor:
      "Foundations, columns, walls, paving slabs, plastering, mortar and brickwork.",
    bagSize: "50 kg",
    classification: "CEM 32.5R (EN 197)",
    strengthDevelopment: "Rapid early strength",
    workability: "Practical all-purpose workability",
    keyFeatures: [
      "Consistent performance",
      "Reliable durability",
      "Practical workability",
      "Economical for general construction",
      "Suitable for a broad range of building activities",
    ],
    applications: [
      "Foundations",
      "Columns",
      "Walls",
      "Paving slabs",
      "Plastering",
      "Brickwork",
      "Mortar",
      "General building work",
    ],
    whyChoose:
      "Choose Grade 32.5R for dependable all-purpose use across common construction activities where workability, consistency and value are important.",
    storage: STORAGE_GUIDANCE,
    compareWith: "32-5n",
    seoTitle: "Camel Cement 32.5R | All-Purpose Cement Tanzania",
    seoDescription:
      "Camel Cement 32.5R offers consistent and economical performance for foundations, walls, columns, paving, plastering, brickwork and mortar.",
  },
  {
    slug: "32-5n",
    grade: "32.5N",
    friendlyName: "Masonry and Stabilisation Cement",
    eyebrow: "ROAD STABILISATION AND MASONRY",
    color: "#008519",
    colorClass: "bg-product-325n",
    image: "/products/32-5n.png",
    description:
      "High workability, controlled heat development and reliable durability for masonry and stabilisation work.",
    heroBody:
      "A workable and durable cement developed for masonry, paving, stabilisation and general site applications that benefit from controlled heat development.",
    bestFor:
      "Road stabilisation, site concrete, paving, masonry and floor repairs.",
    bagSize: "50 kg",
    classification: "CEM 32.5N (EN 197)",
    strengthDevelopment: "Normal early strength",
    workability: "High workability, controlled heat",
    keyFeatures: [
      "High workability",
      "Controlled heat of hydration",
      "Durable performance in demanding conditions",
      "Practical for stabilisation and masonry work",
      "Consistent handling across general site applications",
    ],
    applications: [
      "Road stabilisation",
      "Site concrete",
      "Paving",
      "Masonry",
      "Floor repairs",
      "General non-specialised construction activities",
    ],
    whyChoose:
      "Choose Grade 32.5N for work that prioritises good handling, masonry performance, stabilisation and controlled heat development.",
    storage: STORAGE_GUIDANCE,
    compareWith: "32-5r",
    seoTitle: "Camel Cement 32.5N | Masonry and Stabilisation Cement",
    seoDescription:
      "Camel Cement 32.5N provides high workability and controlled heat development for road stabilisation, site concrete, paving, masonry and floor repairs.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
