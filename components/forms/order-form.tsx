"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { MinusIcon, PlusIcon, TruckIcon, WarehouseIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ErrorSummary,
  FieldError,
  FieldGroup,
  FieldLabel,
  HoneypotField,
  fieldInputClass,
  fieldSelectTriggerClass,
  fieldTextareaClass,
} from "@/components/forms/field";
import { SuccessScreen } from "@/components/forms/success-screen";
import { products, getProduct } from "@/lib/products";
import { regions } from "@/lib/site";
import { cn } from "@/lib/utils";
import { orderSchema } from "@/lib/validation/forms";

const BAG_WEIGHT_KG = 50;

const FULFILMENT_OPTIONS = [
  {
    value: "delivery" as const,
    label: "Delivery",
    description: "We arrange transport to your site or store.",
    icon: TruckIcon,
  },
  {
    value: "collection" as const,
    label: "Collection",
    description: "You collect from the factory or a depot.",
    icon: WarehouseIcon,
  },
];

interface OrderFormState {
  quantities: Record<string, string>;
  fulfilment: "" | "delivery" | "collection";
  region: string;
  district: string;
  siteAddress: string;
  preferredDate: string;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  notes: string;
  consent: boolean;
  website: string;
}

type FieldErrors = Record<string, string>;

function selectedItems(quantities: Record<string, string>) {
  return Object.entries(quantities)
    .map(([productSlug, raw]) => ({
      productSlug,
      quantityBags: Number.parseInt(raw, 10),
    }))
    .filter(
      (item) => Number.isFinite(item.quantityBags) && item.quantityBags >= 1
    );
}

function formatWeight(kg: number): string {
  if (kg >= 1000) {
    const tonnes = kg / 1000;
    return `${tonnes.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} tonnes`;
  }
  return `${kg.toLocaleString()} kg`;
}

export function OrderForm() {
  const [form, setForm] = useState<OrderFormState>({
    quantities: {},
    fulfilment: "",
    region: "",
    district: "",
    siteAddress: "",
    preferredDate: "",
    fullName: "",
    company: "",
    phone: "",
    email: "",
    notes: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    persisted: boolean;
  } | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof OrderFormState>(
    key: K,
    value: OrderFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const setQuantity = (slug: string, raw: string) => {
    setForm((prev) => ({
      ...prev,
      quantities: { ...prev.quantities, [slug]: raw },
    }));
    setErrors((prev) => {
      if (!prev.items) return prev;
      const next = { ...prev };
      delete next.items;
      return next;
    });
  };

  const stepQuantity = (slug: string, delta: number) => {
    setForm((prev) => {
      const current = Number.parseInt(prev.quantities[slug] ?? "0", 10);
      const base = Number.isFinite(current) ? current : 0;
      const next = Math.min(100000, Math.max(0, base + delta));
      return {
        ...prev,
        quantities: { ...prev.quantities, [slug]: next === 0 ? "" : String(next) },
      };
    });
    setErrors((prev) => {
      if (!prev.items) return prev;
      const next = { ...prev };
      delete next.items;
      return next;
    });
  };

  const items = selectedItems(form.quantities);
  const totalBags = items.reduce((sum, item) => sum + item.quantityBags, 0);
  const totalWeightKg = totalBags * BAG_WEIGHT_KG;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      fullName: form.fullName,
      company: form.company,
      phone: form.phone,
      email: form.email,
      items,
      fulfilment: form.fulfilment,
      region: form.region,
      district: form.district,
      siteAddress: form.siteAddress,
      preferredDate: form.preferredDate,
      notes: form.notes,
      consent: form.consent,
      website: form.website,
    };

    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      requestAnimationFrame(() => {
        summaryRef.current?.focus();
        summaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        toast.error(
          json?.error ??
            "Something went wrong while submitting your order. Please try again."
        );
        return;
      }
      setResult({ reference: json.reference, persisted: json.persisted });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <SuccessScreen
        title="Order request submitted"
        reference={result.reference}
        persisted={result.persisted}
        actions={
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-concrete-300 px-6 font-bold text-concrete-800 hover:bg-concrete-100"
          >
            <Link href="/products">Return to products</Link>
          </Button>
        }
      >
        <p>
          Your request has been sent to the Camel Cement sales team for price,
          availability and fulfilment confirmation.
        </p>
        <p className="text-sm text-concrete-600">
          Price, availability and fulfilment details are confirmed by the
          sales team before the order proceeds.
        </p>
      </SuccessScreen>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <HoneypotField
        value={form.website}
        onChange={(value) => update("website", value)}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-10">
          <ErrorSummary
            errors={Object.values(errors)}
            summaryRef={summaryRef}
          />

          <section aria-labelledby="order-products-heading">
            <h2
              id="order-products-heading"
              className="text-h3 text-concrete-950"
            >
              Select products
            </h2>
            <p className="mt-2 text-sm text-concrete-700">
              Quantities are counted in 50 kg bags.
            </p>
            <div className="mt-4">
              <FieldError id="order-items-error">{errors.items}</FieldError>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {products.map((product) => {
                const quantity = form.quantities[product.slug] ?? "";
                return (
                  <div
                    key={product.slug}
                    className="flex flex-col rounded-2xl bg-white p-5 shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        src={product.image}
                        alt={`Camel Cement ${product.grade} bag`}
                        width={72}
                        height={96}
                        className="h-24 w-auto shrink-0 object-contain"
                      />
                      <div>
                        <Badge className="bg-camel-green-100 text-camel-green-800">
                          {product.grade}
                        </Badge>
                        <p className="mt-2 font-bold text-concrete-950">
                          {product.friendlyName}
                        </p>
                        <p className="mt-1 text-sm text-concrete-600">
                          50 kg bag
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => stepQuantity(product.slug, -1)}
                        aria-label={`Remove one bag of ${product.grade} ${product.friendlyName}`}
                        className="size-11 rounded-full border-concrete-300 text-concrete-800 hover:bg-concrete-100"
                      >
                        <MinusIcon className="size-4" />
                      </Button>
                      <Input
                        id={`order-qty-${product.slug}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100000}
                        aria-label={`Quantity of ${product.grade} ${product.friendlyName} in 50 kg bags`}
                        aria-invalid={errors.items ? true : undefined}
                        aria-describedby={
                          errors.items ? "order-items-error" : undefined
                        }
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(product.slug, event.target.value)
                        }
                        placeholder="0"
                        className={cn(
                          fieldInputClass,
                          "h-11 flex-1 text-center tabular-nums"
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => stepQuantity(product.slug, 1)}
                        aria-label={`Add one bag of ${product.grade} ${product.friendlyName}`}
                        className="size-11 rounded-full border-concrete-300 text-concrete-800 hover:bg-concrete-100"
                      >
                        <PlusIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="order-fulfilment-heading">
            <h2
              id="order-fulfilment-heading"
              className="text-h3 text-concrete-950"
            >
              Delivery or collection
            </h2>
            <div
              role="radiogroup"
              aria-label="Fulfilment"
              aria-invalid={errors.fulfilment ? true : undefined}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              {FULFILMENT_OPTIONS.map((option) => {
                const selected = form.fulfilment === option.value;
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-[4px] has-[:focus-visible]:ring-camel-green-700/25",
                      selected
                        ? "border-camel-green-700 bg-camel-green-50"
                        : "border-concrete-300 bg-white hover:border-camel-green-600"
                    )}
                  >
                    <input
                      type="radio"
                      name="fulfilment"
                      value={option.value}
                      checked={selected}
                      onChange={() => update("fulfilment", option.value)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
                        selected
                          ? "bg-camel-green-700 text-white"
                          : "bg-concrete-100 text-concrete-700"
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-concrete-950">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-concrete-600">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-2">
              <FieldError id="order-fulfilment-error">
                {errors.fulfilment}
              </FieldError>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <FieldGroup>
                <FieldLabel htmlFor="order-region" required>
                  Region
                </FieldLabel>
                <Select
                  value={form.region}
                  onValueChange={(value) => update("region", value)}
                >
                  <SelectTrigger
                    id="order-region"
                    aria-invalid={errors.region ? true : undefined}
                    aria-describedby={
                      errors.region ? "order-region-error" : undefined
                    }
                    className={fieldSelectTriggerClass}
                  >
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError id="order-region-error">
                  {errors.region}
                </FieldError>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="order-district">District</FieldLabel>
                <Input
                  id="order-district"
                  name="district"
                  value={form.district}
                  onChange={(event) =>
                    update("district", event.target.value)
                  }
                  className={fieldInputClass}
                />
              </FieldGroup>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <FieldGroup>
                <FieldLabel htmlFor="order-siteAddress">
                  Site address
                </FieldLabel>
                <Input
                  id="order-siteAddress"
                  name="siteAddress"
                  autoComplete="street-address"
                  value={form.siteAddress}
                  onChange={(event) =>
                    update("siteAddress", event.target.value)
                  }
                  className={fieldInputClass}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="order-preferredDate">
                  Preferred date
                </FieldLabel>
                <Input
                  id="order-preferredDate"
                  name="preferredDate"
                  type="date"
                  value={form.preferredDate}
                  onChange={(event) =>
                    update("preferredDate", event.target.value)
                  }
                  className={fieldInputClass}
                />
              </FieldGroup>
            </div>
          </section>

          <section aria-labelledby="order-customer-heading">
            <h2
              id="order-customer-heading"
              className="text-h3 text-concrete-950"
            >
              Customer information
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <FieldGroup>
                <FieldLabel htmlFor="order-fullName" required>
                  Full name
                </FieldLabel>
                <Input
                  id="order-fullName"
                  name="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) =>
                    update("fullName", event.target.value)
                  }
                  aria-invalid={errors.fullName ? true : undefined}
                  aria-describedby={
                    errors.fullName ? "order-fullName-error" : undefined
                  }
                  className={fieldInputClass}
                />
                <FieldError id="order-fullName-error">
                  {errors.fullName}
                </FieldError>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="order-company">Company</FieldLabel>
                <Input
                  id="order-company"
                  name="company"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(event) => update("company", event.target.value)}
                  className={fieldInputClass}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="order-phone" required>
                  Phone
                </FieldLabel>
                <Input
                  id="order-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+255 7XX XXX XXX"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={
                    errors.phone ? "order-phone-error" : undefined
                  }
                  className={fieldInputClass}
                />
                <FieldError id="order-phone-error">{errors.phone}</FieldError>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="order-email">Email</FieldLabel>
                <Input
                  id="order-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={
                    errors.email ? "order-email-error" : undefined
                  }
                  className={fieldInputClass}
                />
                <FieldError id="order-email-error">{errors.email}</FieldError>
              </FieldGroup>
            </div>

            <div className="mt-6">
              <FieldGroup>
                <FieldLabel htmlFor="order-notes">Notes</FieldLabel>
                <Textarea
                  id="order-notes"
                  name="notes"
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  className={fieldTextareaClass}
                />
              </FieldGroup>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-concrete-950">
              Order summary
            </h2>

            {items.length === 0 ? (
              <p className="mt-4 text-sm text-concrete-600">
                No products added yet. Set a quantity to build your order.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {items.map((item) => {
                  const product = getProduct(item.productSlug);
                  return (
                    <li
                      key={item.productSlug}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="text-concrete-800">
                        {product
                          ? `${product.grade} ${product.friendlyName}`
                          : item.productSlug}
                      </span>
                      <span className="font-semibold text-concrete-950 tabular-nums">
                        {item.quantityBags.toLocaleString()} bags
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <Separator className="my-4" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-concrete-600">Total bags</dt>
                <dd className="font-bold text-concrete-950 tabular-nums">
                  {totalBags.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-concrete-600">Estimated total weight</dt>
                <dd className="font-bold text-concrete-950 tabular-nums">
                  {formatWeight(totalWeightKg)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-concrete-600">
              Prices are not shown online. The sales team confirms the price,
              availability and fulfilment after you submit the request.
            </p>

            <div className="mt-5 flex items-start gap-3">
              <Checkbox
                id="order-consent"
                checked={form.consent}
                onCheckedChange={(checked) =>
                  update("consent", checked === true)
                }
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={
                  errors.consent ? "order-consent-error" : undefined
                }
                className="mt-0.5 size-5 rounded-md"
              />
              <label
                htmlFor="order-consent"
                className="text-sm text-concrete-800"
              >
                I consent to Camel Cement contacting me about this order using
                the details provided.
                <span aria-hidden="true" className="text-red-600">
                  {" "}
                  *
                </span>
              </label>
            </div>
            <div className="mt-2">
              <FieldError id="order-consent-error">
                {errors.consent}
              </FieldError>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-5 h-12 w-full rounded-full bg-camel-green-700 font-bold text-white hover:bg-camel-green-800"
            >
              {submitting ? "Submitting..." : "Submit order request"}
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
