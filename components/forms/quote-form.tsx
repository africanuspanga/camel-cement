"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
  TruckIcon,
  WarehouseIcon,
} from "lucide-react";
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
import {
  customerTypes,
  projectTypes,
  quoteRequestSchema,
} from "@/lib/validation/forms";

const STEP_LABELS = [
  "Customer",
  "Products",
  "Project",
  "Fulfilment",
  "Review",
] as const;

const FULFILMENT_OPTIONS = [
  {
    value: "delivery" as const,
    label: "Delivery required",
    description: "We arrange transport to your site or store.",
    icon: TruckIcon,
  },
  {
    value: "collection" as const,
    label: "Collection preferred",
    description: "You collect from the factory or a depot.",
    icon: WarehouseIcon,
  },
  {
    value: "dealer" as const,
    label: "Nearest dealer preferred",
    description: "You buy through an authorised dealer near you.",
    icon: MapPinIcon,
  },
];

const FULFILMENT_LABELS: Record<string, string> = {
  delivery: "Delivery required",
  collection: "Collection preferred",
  dealer: "Nearest dealer preferred",
};

interface QuoteFormState {
  customerType: string;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  quantities: Record<string, string>;
  projectType: string;
  projectName: string;
  region: string;
  district: string;
  siteAddress: string;
  startDate: string;
  deliveryDate: string;
  fulfilment: "" | "delivery" | "collection" | "dealer";
  notes: string;
  consent: boolean;
  website: string;
}

type FieldErrors = Record<string, string>;

const PHONE_PATTERN = /^\+?[0-9()\s-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function validateStep(step: number, form: QuoteFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 1) {
    if (!form.customerType) errors.customerType = "Select a customer type";
    if (form.fullName.trim().length < 2)
      errors.fullName = "Full name is required";
    const phone = form.phone.trim();
    if (
      !PHONE_PATTERN.test(phone) ||
      phone.replace(/\D/g, "").length < 9 ||
      phone.length > 24
    ) {
      errors.phone = "Enter at least 9 digits, for example +255 788 026 188";
    }
    if (form.email.trim() !== "" && !EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
    }
  }

  if (step === 2) {
    const items = selectedItems(form.quantities);
    if (items.length === 0) {
      errors.items = "Add at least one product with a quantity in bags";
    } else if (items.some((item) => item.quantityBags > 100000)) {
      errors.items = "Maximum quantity per product is 100,000 bags";
    }
  }

  if (step === 3) {
    if (!form.projectType) errors.projectType = "Select a project type";
    if (!form.region) errors.region = "Select a region";
  }

  if (step === 4) {
    if (!form.fulfilment)
      errors.fulfilment = "Select a fulfilment preference";
  }

  if (step === 5) {
    if (!form.consent)
      errors.consent = "Please confirm consent before submitting";
  }

  return errors;
}

function stepForField(field: string): number {
  if (
    ["customerType", "fullName", "company", "phone", "email"].includes(field)
  )
    return 1;
  if (field === "items") return 2;
  if (
    [
      "projectType",
      "projectName",
      "region",
      "district",
      "siteAddress",
      "startDate",
      "deliveryDate",
    ].includes(field)
  )
    return 3;
  if (["fulfilment", "notes"].includes(field)) return 4;
  return 5;
}

export function QuoteForm() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState<QuoteFormState>(() => {
    const quantities: Record<string, string> = {};
    const productParam = searchParams.get("product");
    const bagsParam = searchParams.get("bags");
    if (productParam && getProduct(productParam)) {
      const bags = Number.parseInt(bagsParam ?? "", 10);
      quantities[productParam] = String(
        Number.isFinite(bags) && bags >= 1 ? Math.min(bags, 100000) : 1
      );
    }
    return {
      customerType: "",
      fullName: "",
      company: "",
      phone: "",
      email: "",
      quantities,
      projectType: "",
      projectName: "",
      region: "",
      district: "",
      siteAddress: "",
      startDate: "",
      deliveryDate: "",
      fulfilment: "",
      notes: "",
      consent: false,
      website: "",
    };
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    persisted: boolean;
  } | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prefillSource = searchParams.get("source");

  const update = <K extends keyof QuoteFormState>(
    key: K,
    value: QuoteFormState[K]
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

  const focusErrors = () => {
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const goToStep = (next: number) => {
    setErrors({});
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleContinue = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      focusErrors();
      return;
    }
    goToStep(step + 1);
  };

  const handleSubmit = async () => {
    const payload = {
      customerType: form.customerType,
      fullName: form.fullName,
      company: form.company,
      phone: form.phone,
      email: form.email,
      items: selectedItems(form.quantities),
      projectType: form.projectType,
      projectName: form.projectName,
      region: form.region,
      district: form.district,
      siteAddress: form.siteAddress,
      startDate: form.startDate,
      deliveryDate: form.deliveryDate,
      fulfilment: form.fulfilment,
      notes: form.notes,
      consent: form.consent,
      website: form.website,
    };

    const parsed = quoteRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      const firstField = Object.keys(fieldErrors)[0];
      const targetStep = firstField ? stepForField(firstField) : 5;
      if (targetStep !== step) setStep(targetStep);
      focusErrors();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        toast.error(
          json?.error ??
            "Something went wrong while submitting your request. Please try again."
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
      <QuoteSuccess
        reference={result.reference}
        persisted={result.persisted}
        form={form}
      />
    );
  }

  const errorMessages = Object.values(errors);
  const items = selectedItems(form.quantities);

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper step={step} />

      {prefillSource === "calculator" && items.length > 0 && step === 1 ? (
        <p className="mt-6 rounded-xl border border-camel-green-200 bg-camel-green-50 px-4 py-3 text-sm font-medium text-camel-green-800">
          Your calculator result has been added to the products step.
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-card md:p-10">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 5) {
              handleContinue();
            } else {
              void handleSubmit();
            }
          }}
        >
          <HoneypotField
            value={form.website}
            onChange={(value) => update("website", value)}
          />

          <div className="space-y-6">
            <ErrorSummary errors={errorMessages} summaryRef={summaryRef} />

            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-h3 text-concrete-950 outline-none"
            >
              {STEP_LABELS[step - 1]}
            </h2>

            {step === 1 ? (
              <StepCustomer form={form} errors={errors} update={update} />
            ) : null}
            {step === 2 ? (
              <StepProducts
                form={form}
                errors={errors}
                setQuantity={setQuantity}
              />
            ) : null}
            {step === 3 ? (
              <StepProject form={form} errors={errors} update={update} />
            ) : null}
            {step === 4 ? (
              <StepFulfilment form={form} errors={errors} update={update} />
            ) : null}
            {step === 5 ? (
              <StepReview
                form={form}
                errors={errors}
                update={update}
                goToStep={goToStep}
              />
            ) : null}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep(step - 1)}
                className="h-12 rounded-full border-concrete-300 px-6 font-bold text-concrete-800 hover:bg-concrete-100"
              >
                <ArrowLeftIcon className="size-4" />
                Back
              </Button>
            ) : (
              <span />
            )}

            {step < 5 ? (
              <Button
                type="submit"
                className="h-12 rounded-full bg-camel-green-700 px-7 font-bold text-white hover:bg-camel-green-800"
              >
                Continue
                <ArrowRightIcon className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-full bg-camel-green-700 px-7 font-bold text-white hover:bg-camel-green-800"
              >
                {submitting ? "Submitting..." : "Submit quotation request"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <nav aria-label="Progress">
      <p className="text-sm font-semibold text-concrete-700">
        Step {step} of {STEP_LABELS.length}
      </p>
      <ol className="mt-3 flex items-start gap-1 sm:gap-2">
        {STEP_LABELS.map((label, index) => {
          const number = index + 1;
          const state =
            number < step ? "done" : number === step ? "active" : "future";
          return (
            <li
              key={label}
              aria-current={state === "active" ? "step" : undefined}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                  state === "done" && "bg-camel-green-700 text-white",
                  state === "active" &&
                    "border-2 border-camel-green-700 bg-camel-green-50 text-camel-green-800",
                  state === "future" && "bg-concrete-200 text-concrete-600"
                )}
              >
                {state === "done" ? <CheckIcon className="size-4" /> : number}
              </span>
              <span
                className={cn(
                  "text-center text-xs font-semibold",
                  state === "active"
                    ? "text-camel-green-800"
                    : "text-concrete-600"
                )}
              >
                {label}
                {state === "done" ? (
                  <span className="sr-only"> (completed)</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepCustomer({
  form,
  errors,
  update,
}: {
  form: QuoteFormState;
  errors: FieldErrors;
  update: <K extends keyof QuoteFormState>(
    key: K,
    value: QuoteFormState[K]
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold text-concrete-950">
          Customer type
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
        </legend>
        <div
          role="radiogroup"
          aria-label="Customer type"
          aria-invalid={errors.customerType ? true : undefined}
          className="mt-3 flex flex-wrap gap-2"
        >
          {customerTypes.map((type) => {
            const selected = form.customerType === type;
            return (
              <label
                key={type}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-[4px] has-[:focus-visible]:ring-camel-green-700/25",
                  selected
                    ? "border-camel-green-700 bg-camel-green-700 text-white"
                    : "border-concrete-300 bg-white text-concrete-800 hover:border-camel-green-600"
                )}
              >
                <input
                  type="radio"
                  name="customerType"
                  value={type}
                  checked={selected}
                  onChange={() => update("customerType", type)}
                  className="sr-only"
                />
                {type}
              </label>
            );
          })}
        </div>
        <div className="mt-2">
          <FieldError id="customerType-error">
            {errors.customerType}
          </FieldError>
        </div>
      </fieldset>

      <FieldGroup>
        <FieldLabel htmlFor="quote-fullName" required>
          Full name
        </FieldLabel>
        <Input
          id="quote-fullName"
          name="fullName"
          autoComplete="name"
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? "quote-fullName-error" : undefined}
          className={fieldInputClass}
        />
        <FieldError id="quote-fullName-error">{errors.fullName}</FieldError>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="quote-company">Company or organisation</FieldLabel>
        <Input
          id="quote-company"
          name="company"
          autoComplete="organization"
          value={form.company}
          onChange={(event) => update("company", event.target.value)}
          className={fieldInputClass}
        />
      </FieldGroup>

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="quote-phone" required>
            Phone
          </FieldLabel>
          <Input
            id="quote-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+255 7XX XXX XXX"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "quote-phone-error" : undefined}
            className={fieldInputClass}
          />
          <FieldError id="quote-phone-error">{errors.phone}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="quote-email">Email</FieldLabel>
          <Input
            id="quote-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "quote-email-error" : undefined}
            className={fieldInputClass}
          />
          <FieldError id="quote-email-error">{errors.email}</FieldError>
        </FieldGroup>
      </div>
    </div>
  );
}

function StepProducts({
  form,
  errors,
  setQuantity,
}: {
  form: QuoteFormState;
  errors: FieldErrors;
  setQuantity: (slug: string, raw: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-concrete-700">
        Enter the quantity in 50 kg bags for each product you need. Leave the
        other products at zero.
      </p>
      <FieldError id="quote-items-error">{errors.items}</FieldError>
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.slug}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-concrete-200 bg-white p-4"
          >
            <div className="min-w-44 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-concrete-950">
                  {product.friendlyName}
                </span>
                <Badge className="bg-camel-green-100 text-camel-green-800">
                  {product.grade}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-concrete-600">
                {product.bagSize} bag
              </p>
            </div>
            <FieldGroup className="w-40">
              <FieldLabel htmlFor={`quote-qty-${product.slug}`}>
                Bags
              </FieldLabel>
              <Input
                id={`quote-qty-${product.slug}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={100000}
                aria-label={`Quantity of ${product.grade} ${product.friendlyName} in 50 kg bags`}
                aria-invalid={errors.items ? true : undefined}
                aria-describedby={
                  errors.items ? "quote-items-error" : undefined
                }
                value={form.quantities[product.slug] ?? ""}
                onChange={(event) =>
                  setQuantity(product.slug, event.target.value)
                }
                placeholder="0"
                className={cn(fieldInputClass, "tabular-nums")}
              />
            </FieldGroup>
          </div>
        ))}
      </div>
      <p className="text-sm text-concrete-700">
        Do you need help choosing a product?{" "}
        <Link
          href="/products/finder"
          className="font-semibold text-camel-green-700 underline underline-offset-4 hover:text-camel-green-800"
        >
          Try the product finder
        </Link>
      </p>
    </div>
  );
}

function StepProject({
  form,
  errors,
  update,
}: {
  form: QuoteFormState;
  errors: FieldErrors;
  update: <K extends keyof QuoteFormState>(
    key: K,
    value: QuoteFormState[K]
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="quote-projectType" required>
            Project type
          </FieldLabel>
          <Select
            value={form.projectType}
            onValueChange={(value) => update("projectType", value)}
          >
            <SelectTrigger
              id="quote-projectType"
              aria-invalid={errors.projectType ? true : undefined}
              aria-describedby={
                errors.projectType ? "quote-projectType-error" : undefined
              }
              className={fieldSelectTriggerClass}
            >
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent position="popper">
              {projectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="quote-projectType-error">
            {errors.projectType}
          </FieldError>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="quote-projectName">Project name</FieldLabel>
          <Input
            id="quote-projectName"
            name="projectName"
            value={form.projectName}
            onChange={(event) => update("projectName", event.target.value)}
            className={fieldInputClass}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="quote-region" required>
            Region
          </FieldLabel>
          <Select
            value={form.region}
            onValueChange={(value) => update("region", value)}
          >
            <SelectTrigger
              id="quote-region"
              aria-invalid={errors.region ? true : undefined}
              aria-describedby={
                errors.region ? "quote-region-error" : undefined
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
          <FieldError id="quote-region-error">{errors.region}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="quote-district">District</FieldLabel>
          <Input
            id="quote-district"
            name="district"
            value={form.district}
            onChange={(event) => update("district", event.target.value)}
            className={fieldInputClass}
          />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel htmlFor="quote-siteAddress">Site address</FieldLabel>
        <Input
          id="quote-siteAddress"
          name="siteAddress"
          autoComplete="street-address"
          value={form.siteAddress}
          onChange={(event) => update("siteAddress", event.target.value)}
          className={fieldInputClass}
        />
      </FieldGroup>

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="quote-startDate">
            Expected start date
          </FieldLabel>
          <Input
            id="quote-startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={(event) => update("startDate", event.target.value)}
            className={fieldInputClass}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="quote-deliveryDate">
            Required delivery date
          </FieldLabel>
          <Input
            id="quote-deliveryDate"
            name="deliveryDate"
            type="date"
            value={form.deliveryDate}
            onChange={(event) => update("deliveryDate", event.target.value)}
            className={fieldInputClass}
          />
        </FieldGroup>
      </div>
    </div>
  );
}

function StepFulfilment({
  form,
  errors,
  update,
}: {
  form: QuoteFormState;
  errors: FieldErrors;
  update: <K extends keyof QuoteFormState>(
    key: K,
    value: QuoteFormState[K]
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold text-concrete-950">
          How would you like to receive the cement?
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
        </legend>
        <div
          role="radiogroup"
          aria-label="Fulfilment preference"
          aria-invalid={errors.fulfilment ? true : undefined}
          className="mt-3 grid gap-3"
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
          <FieldError id="quote-fulfilment-error">
            {errors.fulfilment}
          </FieldError>
        </div>
      </fieldset>

      <FieldGroup>
        <FieldLabel htmlFor="quote-notes">Additional handling notes</FieldLabel>
        <Textarea
          id="quote-notes"
          name="notes"
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          className={fieldTextareaClass}
        />
      </FieldGroup>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-1.5">
      <dt className="text-sm text-concrete-600">{label}</dt>
      <dd className="text-sm font-semibold text-concrete-950">{value}</dd>
    </div>
  );
}

function ReviewSection({
  title,
  stepNumber,
  goToStep,
  children,
}: {
  title: string;
  stepNumber: number;
  goToStep: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-concrete-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-concrete-950">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          onClick={() => goToStep(stepNumber)}
          className="h-11 rounded-full px-4 font-semibold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
        >
          Edit
          <span className="sr-only"> {title.toLowerCase()} details</span>
        </Button>
      </div>
      <dl className="mt-2 divide-y divide-concrete-100">{children}</dl>
    </section>
  );
}

function StepReview({
  form,
  errors,
  update,
  goToStep,
}: {
  form: QuoteFormState;
  errors: FieldErrors;
  update: <K extends keyof QuoteFormState>(
    key: K,
    value: QuoteFormState[K]
  ) => void;
  goToStep: (step: number) => void;
}) {
  const items = selectedItems(form.quantities);
  return (
    <div className="space-y-4">
      <ReviewSection title="Customer" stepNumber={1} goToStep={goToStep}>
        <ReviewRow label="Customer type" value={form.customerType} />
        <ReviewRow label="Full name" value={form.fullName} />
        <ReviewRow label="Company or organisation" value={form.company} />
        <ReviewRow label="Phone" value={form.phone} />
        <ReviewRow label="Email" value={form.email} />
      </ReviewSection>

      <ReviewSection title="Products" stepNumber={2} goToStep={goToStep}>
        {items.map((item) => {
          const product = getProduct(item.productSlug);
          return (
            <ReviewRow
              key={item.productSlug}
              label={
                product
                  ? `${product.grade} ${product.friendlyName}`
                  : item.productSlug
              }
              value={`${item.quantityBags.toLocaleString()} bags`}
            />
          );
        })}
      </ReviewSection>

      <ReviewSection title="Project" stepNumber={3} goToStep={goToStep}>
        <ReviewRow label="Project type" value={form.projectType} />
        <ReviewRow label="Project name" value={form.projectName} />
        <ReviewRow label="Region" value={form.region} />
        <ReviewRow label="District" value={form.district} />
        <ReviewRow label="Site address" value={form.siteAddress} />
        <ReviewRow label="Expected start date" value={form.startDate} />
        <ReviewRow label="Required delivery date" value={form.deliveryDate} />
      </ReviewSection>

      <ReviewSection title="Fulfilment" stepNumber={4} goToStep={goToStep}>
        <ReviewRow
          label="Preference"
          value={FULFILMENT_LABELS[form.fulfilment] ?? undefined}
        />
        <ReviewRow label="Additional handling notes" value={form.notes} />
      </ReviewSection>

      <div className="flex items-start gap-3 pt-2">
        <Checkbox
          id="quote-consent"
          checked={form.consent}
          onCheckedChange={(checked) => update("consent", checked === true)}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "quote-consent-error" : undefined}
          className="mt-0.5 size-5 rounded-md"
        />
        <label
          htmlFor="quote-consent"
          className="text-sm text-concrete-800"
        >
          I consent to Camel Cement contacting me about this request using the
          details provided.
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
        </label>
      </div>
      <FieldError id="quote-consent-error">{errors.consent}</FieldError>
    </div>
  );
}

function QuoteSuccess({
  reference,
  persisted,
  form,
}: {
  reference: string;
  persisted: boolean;
  form: QuoteFormState;
}) {
  const items = selectedItems(form.quantities);
  return (
    <>
      <SuccessScreen
        title="Quotation request received"
        reference={reference}
        persisted={persisted}
        actions={
          <>
            <Button
              type="button"
              onClick={() => window.print()}
              className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
            >
              Download request summary
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-concrete-300 px-6 font-bold text-concrete-800 hover:bg-concrete-100"
            >
              <Link href="/products">Return to products</Link>
            </Button>
          </>
        }
      >
        <p>
          Your reference number is <strong>{reference}</strong>. The Camel
          Cement sales team will review your request and contact you using the
          details provided.
        </p>
      </SuccessScreen>

      <div id="quote-print-summary" className="hidden print:block">
        <h1 className="text-2xl font-bold">
          Camel Cement quotation request summary
        </h1>
        <p className="mt-2">Reference: {reference}</p>
        <dl className="mt-4 space-y-1">
          <div>
            <dt className="inline font-semibold">Customer type: </dt>
            <dd className="inline">{form.customerType}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Full name: </dt>
            <dd className="inline">{form.fullName}</dd>
          </div>
          {form.company ? (
            <div>
              <dt className="inline font-semibold">Company: </dt>
              <dd className="inline">{form.company}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-semibold">Phone: </dt>
            <dd className="inline">{form.phone}</dd>
          </div>
          {form.email ? (
            <div>
              <dt className="inline font-semibold">Email: </dt>
              <dd className="inline">{form.email}</dd>
            </div>
          ) : null}
          {items.map((item) => {
            const product = getProduct(item.productSlug);
            return (
              <div key={item.productSlug}>
                <dt className="inline font-semibold">
                  {product
                    ? `${product.grade} ${product.friendlyName}`
                    : item.productSlug}
                  :{" "}
                </dt>
                <dd className="inline">
                  {item.quantityBags.toLocaleString()} bags
                </dd>
              </div>
            );
          })}
          <div>
            <dt className="inline font-semibold">Project type: </dt>
            <dd className="inline">{form.projectType}</dd>
          </div>
          {form.projectName ? (
            <div>
              <dt className="inline font-semibold">Project name: </dt>
              <dd className="inline">{form.projectName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-semibold">Region: </dt>
            <dd className="inline">{form.region}</dd>
          </div>
          {form.district ? (
            <div>
              <dt className="inline font-semibold">District: </dt>
              <dd className="inline">{form.district}</dd>
            </div>
          ) : null}
          {form.siteAddress ? (
            <div>
              <dt className="inline font-semibold">Site address: </dt>
              <dd className="inline">{form.siteAddress}</dd>
            </div>
          ) : null}
          {form.startDate ? (
            <div>
              <dt className="inline font-semibold">Expected start date: </dt>
              <dd className="inline">{form.startDate}</dd>
            </div>
          ) : null}
          {form.deliveryDate ? (
            <div>
              <dt className="inline font-semibold">
                Required delivery date:{" "}
              </dt>
              <dd className="inline">{form.deliveryDate}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-semibold">Fulfilment: </dt>
            <dd className="inline">
              {FULFILMENT_LABELS[form.fulfilment] ?? form.fulfilment}
            </dd>
          </div>
          {form.notes ? (
            <div>
              <dt className="inline font-semibold">Notes: </dt>
              <dd className="inline">{form.notes}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #quote-print-summary, #quote-print-summary * { visibility: visible; }
          #quote-print-summary { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
        }
      `}</style>
    </>
  );
}
