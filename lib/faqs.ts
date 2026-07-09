export interface Faq {
  question: string;
  answer: string;
  category: string;
}

export const faqs: Faq[] = [
  {
    question: "Which Camel Cement grade should I use?",
    answer:
      "The suitable grade depends on the construction activity, required strength development and project specification. Use the product finder or speak with the technical team for guidance. Structural work should follow the approved design and professional specification.",
    category: "Products",
  },
  {
    question: "What is the difference between 32.5 and 42.5 cement?",
    answer:
      "The numbers identify strength classes measured under standard testing conditions. Grade 42.5 products are generally selected for higher-strength and more demanding structural applications. Grade 32.5 products are commonly used for general building, masonry, plastering, stabilisation and other suitable applications.",
    category: "Products",
  },
  {
    question: "What do N and R mean?",
    answer:
      "N identifies normal early strength development. R identifies rapid early strength development. Product selection should consider the construction schedule, application and project specification.",
    category: "Products",
  },
  {
    question: "What size are Camel Cement bags?",
    answer: "Camel Cement products are supplied in 50 kg bags.",
    category: "Products",
  },
  {
    question: "Do Camel Cement products comply with recognised standards?",
    answer: "Yes. Camel Cement's four grades comply with EN 197 standards.",
    category: "Products",
  },
  {
    question: "Can I buy cement through the website?",
    answer:
      "Yes. You can prepare an order request online by selecting the product, quantity and fulfilment details. The sales team will confirm the price, availability and next steps.",
    category: "Ordering",
  },
  {
    question: "Can I request a bulk quotation?",
    answer:
      "Yes. Use the Request a Quote form and provide the products, quantities, project location, delivery preference and required date.",
    category: "Ordering",
  },
  {
    question: "Can I find a dealer near me?",
    answer:
      "Yes. Use the dealer locator to search by region, district or location. You can also call +255 788 026 188 for assistance.",
    category: "Ordering",
  },
  {
    question: "Are calculator results exact?",
    answer:
      "No. The calculator provides preliminary estimates for planning. Actual quantities depend on the approved mix design, measurements, site conditions, materials, workmanship and wastage.",
    category: "Calculator",
  },
  {
    question: "Can I use a calculator result to request a quote?",
    answer:
      "Yes. Every saved calculator result can be sent directly into the quotation workflow.",
    category: "Calculator",
  },
  {
    question: "How should cement be stored?",
    answer:
      "Keep cement in a dry, covered and well-ventilated place. Raise bags above the floor, protect them from moisture, keep them away from external walls and use older stock first.",
    category: "Storage",
  },
  {
    question: "Can I use a bag that has hardened?",
    answer:
      "Do not use cement that has hardened into lumps or has been damaged by moisture. Contact the sales or technical team when product condition is uncertain.",
    category: "Storage",
  },
];
