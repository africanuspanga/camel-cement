"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
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
import { products } from "@/lib/products";
import { regions } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  contactSchema,
  enquiryTypes,
  preferredContactMethods,
} from "@/lib/validation/forms";

interface ContactFormState {
  enquiryType: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  region: string;
  district: string;
  product: string;
  message: string;
  preferredContact: string;
  consent: boolean;
  website: string;
}

type FieldErrors = Record<string, string>;

const INITIAL_STATE: ContactFormState = {
  enquiryType: "",
  fullName: "",
  company: "",
  email: "",
  phone: "",
  region: "",
  district: "",
  product: "",
  message: "",
  preferredContact: "",
  consent: false,
  website: "",
};

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    persisted: boolean;
  } | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      enquiryType: form.enquiryType,
      fullName: form.fullName,
      company: form.company,
      email: form.email,
      phone: form.phone,
      region: form.region,
      district: form.district,
      product: form.product,
      message: form.message,
      preferredContact:
        form.preferredContact === "" ? undefined : form.preferredContact,
      sourcePage: "/contact",
      consent: form.consent,
      website: form.website,
    };

    const parsed = contactSchema.safeParse(payload);
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        toast.error(
          json?.error ??
            "Something went wrong while sending your enquiry. Please try again."
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
        title="Enquiry received"
        reference={result.reference}
        persisted={result.persisted}
      >
        <p>
          Thank you. Your enquiry has been received. A Camel Cement
          representative will contact you using the details provided.
        </p>
      </SuccessScreen>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-card md:p-10"
    >
      <HoneypotField
        value={form.website}
        onChange={(value) => update("website", value)}
      />

      <div className="space-y-6">
        <ErrorSummary errors={Object.values(errors)} summaryRef={summaryRef} />

        <FieldGroup>
          <FieldLabel htmlFor="contact-enquiryType" required>
            Enquiry type
          </FieldLabel>
          <Select
            value={form.enquiryType}
            onValueChange={(value) => update("enquiryType", value)}
          >
            <SelectTrigger
              id="contact-enquiryType"
              aria-invalid={errors.enquiryType ? true : undefined}
              aria-describedby={
                errors.enquiryType ? "contact-enquiryType-error" : undefined
              }
              className={fieldSelectTriggerClass}
            >
              <SelectValue placeholder="Select enquiry type" />
            </SelectTrigger>
            <SelectContent position="popper">
              {enquiryTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="contact-enquiryType-error">
            {errors.enquiryType}
          </FieldError>
        </FieldGroup>

        <div className="grid gap-6 sm:grid-cols-2">
          <FieldGroup>
            <FieldLabel htmlFor="contact-fullName" required>
              Full name
            </FieldLabel>
            <Input
              id="contact-fullName"
              name="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={
                errors.fullName ? "contact-fullName-error" : undefined
              }
              className={fieldInputClass}
            />
            <FieldError id="contact-fullName-error">
              {errors.fullName}
            </FieldError>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="contact-company">Company</FieldLabel>
            <Input
              id="contact-company"
              name="company"
              autoComplete="organization"
              value={form.company}
              onChange={(event) => update("company", event.target.value)}
              className={fieldInputClass}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="contact-email" required>
              Email
            </FieldLabel>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={
                errors.email ? "contact-email-error" : undefined
              }
              className={fieldInputClass}
            />
            <FieldError id="contact-email-error">{errors.email}</FieldError>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="contact-phone" required>
              Phone
            </FieldLabel>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+255 7XX XXX XXX"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={
                errors.phone ? "contact-phone-error" : undefined
              }
              className={fieldInputClass}
            />
            <FieldError id="contact-phone-error">{errors.phone}</FieldError>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="contact-region">Region</FieldLabel>
            <Select
              value={form.region}
              onValueChange={(value) => update("region", value)}
            >
              <SelectTrigger
                id="contact-region"
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
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="contact-district">District</FieldLabel>
            <Input
              id="contact-district"
              name="district"
              value={form.district}
              onChange={(event) => update("district", event.target.value)}
              className={fieldInputClass}
            />
          </FieldGroup>
        </div>

        <FieldGroup>
          <FieldLabel htmlFor="contact-product">Product</FieldLabel>
          <Select
            value={form.product}
            onValueChange={(value) => update("product", value)}
          >
            <SelectTrigger
              id="contact-product"
              className={fieldSelectTriggerClass}
            >
              <SelectValue placeholder="Select a product (optional)" />
            </SelectTrigger>
            <SelectContent position="popper">
              {products.map((product) => (
                <SelectItem
                  key={product.slug}
                  value={`${product.grade} ${product.friendlyName}`}
                >
                  {product.grade} {product.friendlyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="contact-message" required>
            Message
          </FieldLabel>
          <Textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
            className={fieldTextareaClass}
          />
          <FieldError id="contact-message-error">{errors.message}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="contact-attachment">File attachment</FieldLabel>
          <Input
            id="contact-attachment"
            name="attachment"
            type="file"
            disabled
            aria-describedby="contact-attachment-help"
            className={cn(fieldInputClass, "pt-3.5")}
          />
          <p
            id="contact-attachment-help"
            className="text-sm text-concrete-600"
          >
            Attachment upload will be enabled soon
          </p>
        </FieldGroup>

        <fieldset>
          <legend className="text-sm font-semibold text-concrete-950">
            Preferred contact method
          </legend>
          <div
            role="radiogroup"
            aria-label="Preferred contact method"
            className="mt-3 flex flex-wrap gap-2"
          >
            {preferredContactMethods.map((method) => {
              const selected = form.preferredContact === method;
              return (
                <label
                  key={method}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-[4px] has-[:focus-visible]:ring-camel-green-700/25",
                    selected
                      ? "border-camel-green-700 bg-camel-green-700 text-white"
                      : "border-concrete-300 bg-white text-concrete-800 hover:border-camel-green-600"
                  )}
                >
                  <input
                    type="radio"
                    name="preferredContact"
                    value={method}
                    checked={selected}
                    onChange={() => update("preferredContact", method)}
                    className="sr-only"
                  />
                  {method}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-start gap-3">
          <Checkbox
            id="contact-consent"
            checked={form.consent}
            onCheckedChange={(checked) => update("consent", checked === true)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={
              errors.consent ? "contact-consent-error" : undefined
            }
            className="mt-0.5 size-5 rounded-md"
          />
          <label
            htmlFor="contact-consent"
            className="text-sm text-concrete-800"
          >
            I consent to Camel Cement contacting me about this enquiry using
            the details provided.
            <span aria-hidden="true" className="text-red-600">
              {" "}
              *
            </span>
          </label>
        </div>
        <FieldError id="contact-consent-error">{errors.consent}</FieldError>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-full bg-camel-green-700 px-7 font-bold text-white hover:bg-camel-green-800"
        >
          {submitting ? "Sending..." : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}
