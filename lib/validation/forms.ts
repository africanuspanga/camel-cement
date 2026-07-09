import { z } from "zod";

export const customerTypes = [
  "Individual",
  "Contractor",
  "Developer",
  "Retailer",
  "Dealer",
  "Institution",
  "Government",
  "Other",
] as const;

export const projectTypes = [
  "Residential home",
  "Commercial building",
  "Road or infrastructure",
  "Precast or block production",
  "Industrial",
  "Public or institutional",
  "Other",
] as const;

export const enquiryTypes = [
  "Product enquiry",
  "Request a quotation",
  "Order support",
  "Dealer enquiry",
  "Technical support",
  "Quality concern",
  "Careers",
  "Media enquiry",
  "General enquiry",
] as const;

export const preferredContactMethods = ["Phone", "Email", "WhatsApp"] as const;

export const quoteFulfilmentOptions = [
  "delivery",
  "collection",
  "dealer",
] as const;

export const orderFulfilmentOptions = ["delivery", "collection"] as const;

/**
 * Tanzanian-friendly phone validation: accepts +255..., 0..., spaces,
 * dashes and parentheses, and requires at least 9 digits overall.
 */
const phoneField = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .max(24, "Phone number is too long")
  .regex(/^\+?[0-9()\s-]+$/, "Use digits only, with an optional leading +")
  .refine((value) => value.replace(/\D/g, "").length >= 9, {
    message: "Enter at least 9 digits, for example +255 788 026 188",
  });

const optionalEmailField = z
  .string()
  .trim()
  .max(200, "Email is too long")
  .refine((value) => value === "" || z.email().safeParse(value).success, {
    message: "Enter a valid email address",
  })
  .optional();

const requiredEmailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(200, "Email is too long")
  .refine((value) => z.email().safeParse(value).success, {
    message: "Enter a valid email address",
  });

const optionalIsoDateField = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use a valid date",
  })
  .optional();

const optionalText = (max: number) => z.string().trim().max(max).optional();

/** Honeypot: bots fill it, humans never see it. Must stay empty. */
const honeypotField = z.string().max(0).optional();

const consentField = z.literal(true, {
  message: "Please confirm consent before submitting",
});

export const quoteItemSchema = z.object({
  productSlug: z.string().min(1, "Select a product"),
  quantityBags: z
    .number({ message: "Enter a quantity in bags" })
    .int("Quantities are counted in whole bags")
    .min(1, "Minimum quantity is 1 bag")
    .max(100000, "Maximum quantity is 100,000 bags"),
});

export const quoteRequestSchema = z.object({
  customerType: z.enum(customerTypes, { message: "Select a customer type" }),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(160, "Full name is too long"),
  company: optionalText(160),
  phone: phoneField,
  email: optionalEmailField,
  items: z
    .array(quoteItemSchema)
    .min(1, "Add at least one product with a quantity in bags"),
  projectType: z.enum(projectTypes, { message: "Select a project type" }),
  projectName: optionalText(200),
  region: z.string().trim().min(1, "Select a region"),
  district: optionalText(120),
  siteAddress: optionalText(400),
  startDate: optionalIsoDateField,
  deliveryDate: optionalIsoDateField,
  fulfilment: z.enum(quoteFulfilmentOptions, {
    message: "Select a fulfilment preference",
  }),
  notes: optionalText(2000),
  consent: consentField,
  website: honeypotField,
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const orderSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(160, "Full name is too long"),
  company: optionalText(160),
  phone: phoneField,
  email: optionalEmailField,
  items: z
    .array(quoteItemSchema)
    .min(1, "Add at least one product with a quantity in bags"),
  fulfilment: z.enum(orderFulfilmentOptions, {
    message: "Select delivery or collection",
  }),
  region: z.string().trim().min(1, "Select a region"),
  district: optionalText(120),
  siteAddress: optionalText(400),
  preferredDate: optionalIsoDateField,
  notes: optionalText(2000),
  consent: consentField,
  website: honeypotField,
});

export type OrderInput = z.infer<typeof orderSchema>;

export const contactSchema = z.object({
  enquiryType: z.enum(enquiryTypes, { message: "Select an enquiry type" }),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(160, "Full name is too long"),
  company: optionalText(160),
  email: requiredEmailField,
  phone: phoneField,
  region: optionalText(80),
  district: optionalText(120),
  product: optionalText(120),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(4000, "Message must be 4000 characters or fewer"),
  preferredContact: z.enum(preferredContactMethods).optional(),
  sourcePage: optionalText(200),
  consent: consentField,
  website: honeypotField,
});

export type ContactInput = z.infer<typeof contactSchema>;
