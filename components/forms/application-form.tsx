"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
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
import { regions } from "@/lib/site";
import { cn } from "@/lib/utils";

const WORK_EXPERIENCE_OPTIONS = [
  "0-2 years",
  "3-5 years",
  "6-10 years",
  "10+ years",
];

const EDUCATION_OPTIONS = [
  "Certificate",
  "Diploma",
  "Bachelor degree",
  "Master degree",
  "Other",
];

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ACCEPT_ATTRIBUTE = ".pdf,.doc,.docx";

const PHONE_PATTERN = /^\+?[0-9()\s-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fileInputClass =
  "h-13 rounded-xl border-concrete-300 bg-white px-3.5 text-sm text-concrete-800 file:mr-3 file:h-full file:border-0 file:bg-transparent file:font-semibold file:text-camel-green-700 focus-visible:border-camel-green-700 focus-visible:ring-[4px] focus-visible:ring-camel-green-700/12 aria-invalid:border-red-600 aria-invalid:ring-red-600/15";

interface ApplicationFormState {
  fullName: string;
  email: string;
  phone: string;
  region: string;
  currentLocation: string;
  workExperience: string;
  educationLevel: string;
  coverLetter: string;
  consent: boolean;
  website: string; // Honeypot, must stay empty
}

type FieldErrors = Record<string, string>;

const initialState: ApplicationFormState = {
  fullName: "",
  email: "",
  phone: "",
  region: "",
  currentLocation: "",
  workExperience: "",
  educationLevel: "",
  coverLetter: "",
  consent: false,
  website: "",
};

function checkFile(file: File | null, required: boolean): string | undefined {
  if (!file || file.size === 0) {
    return required ? "Upload your CV as a PDF, DOC or DOCX file" : undefined;
  }
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Only PDF, DOC or DOCX files are accepted";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "The file must be 5 MB or smaller";
  }
  return undefined;
}

export function ApplicationForm({
  slug,
  positionTitle,
}: {
  slug: string;
  positionTitle: string;
}) {
  const [form, setForm] = useState<ApplicationFormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    persisted: boolean;
  } | null>(null);

  const cvRef = useRef<HTMLInputElement>(null);
  const supportingRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof ApplicationFormState>(
    key: K,
    value: ApplicationFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const clearFileError = (key: "cv" | "supporting") =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (form.fullName.trim().length < 2) next.fullName = "Enter your full name";
    if (!EMAIL_PATTERN.test(form.email.trim()))
      next.email = "Enter a valid email address";
    const phone = form.phone.trim();
    if (
      !PHONE_PATTERN.test(phone) ||
      phone.replace(/\D/g, "").length < 9 ||
      phone.length > 24
    ) {
      next.phone = "Enter at least 9 digits, for example +255 788 026 188";
    }
    if (!form.region) next.region = "Select your region";
    if (form.currentLocation.trim().length < 2)
      next.currentLocation = "Enter your current location";
    if (!form.workExperience)
      next.workExperience = "Select your work experience";
    if (!form.educationLevel)
      next.educationLevel = "Select your education level";

    const cvError = checkFile(cvRef.current?.files?.[0] ?? null, true);
    if (cvError) next.cv = cvError;
    const supportingError = checkFile(
      supportingRef.current?.files?.[0] ?? null,
      false
    );
    if (supportingError) next.supporting = supportingError;

    if (!form.consent) next.consent = "Please confirm consent before applying";
    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.set("slug", slug);
      payload.set("fullName", form.fullName.trim());
      payload.set("email", form.email.trim());
      payload.set("phone", form.phone.trim());
      payload.set("region", form.region);
      payload.set("currentLocation", form.currentLocation.trim());
      payload.set("workExperience", form.workExperience);
      payload.set("educationLevel", form.educationLevel);
      payload.set("coverLetter", form.coverLetter.trim());
      payload.set("consent", String(form.consent));
      payload.set("website", form.website);
      const cvFile = cvRef.current?.files?.[0];
      if (cvFile) payload.set("cv", cvFile);
      const supportingFile = supportingRef.current?.files?.[0];
      if (supportingFile) payload.set("supporting", supportingFile);

      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body: payload,
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        toast.error(
          json?.error ??
            "Your application could not be submitted. Please try again."
        );
        return;
      }
      setResult({ reference: json.reference, persisted: json.persisted });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <SuccessScreen
        title="Application received"
        reference={result.reference}
        persisted={result.persisted}
        actions={
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-concrete-300 px-6 font-bold text-concrete-800 hover:bg-concrete-100"
          >
            <Link href="/careers">Back to careers</Link>
          </Button>
        }
      >
        <p>
          Thank you for applying for the <strong>{positionTitle}</strong> role.
          Your reference number is <strong>{result.reference}</strong>. The
          recruitment team will review your application and contact you if you
          are shortlisted.
        </p>
      </SuccessScreen>
    );
  }

  const errorMessages = Object.values(errors);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative space-y-6 rounded-[24px] border border-concrete-200 bg-white p-7 shadow-card md:p-9"
    >
      <HoneypotField
        value={form.website}
        onChange={(value) => update("website", value)}
      />

      <ErrorSummary errors={errorMessages} summaryRef={summaryRef} />

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="apply-fullName" required>
            Full name
          </FieldLabel>
          <Input
            id="apply-fullName"
            name="fullName"
            autoComplete="name"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={
              errors.fullName ? "apply-fullName-error" : undefined
            }
            className={fieldInputClass}
          />
          <FieldError id="apply-fullName-error">{errors.fullName}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="apply-email" required>
            Email
          </FieldLabel>
          <Input
            id="apply-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "apply-email-error" : undefined}
            className={fieldInputClass}
          />
          <FieldError id="apply-email-error">{errors.email}</FieldError>
        </FieldGroup>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="apply-phone" required>
            Phone
          </FieldLabel>
          <Input
            id="apply-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+255 7XX XXX XXX"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "apply-phone-error" : undefined}
            className={fieldInputClass}
          />
          <FieldError id="apply-phone-error">{errors.phone}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="apply-region" required>
            Region
          </FieldLabel>
          <Select
            value={form.region}
            onValueChange={(value) => update("region", value)}
          >
            <SelectTrigger
              id="apply-region"
              aria-invalid={errors.region ? true : undefined}
              aria-describedby={
                errors.region ? "apply-region-error" : undefined
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
          <FieldError id="apply-region-error">{errors.region}</FieldError>
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel htmlFor="apply-currentLocation" required>
          Current location
        </FieldLabel>
        <Input
          id="apply-currentLocation"
          name="currentLocation"
          placeholder="City, district or town"
          value={form.currentLocation}
          onChange={(event) => update("currentLocation", event.target.value)}
          aria-invalid={errors.currentLocation ? true : undefined}
          aria-describedby={
            errors.currentLocation ? "apply-currentLocation-error" : undefined
          }
          className={fieldInputClass}
        />
        <FieldError id="apply-currentLocation-error">
          {errors.currentLocation}
        </FieldError>
      </FieldGroup>

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="apply-workExperience" required>
            Work experience
          </FieldLabel>
          <Select
            value={form.workExperience}
            onValueChange={(value) => update("workExperience", value)}
          >
            <SelectTrigger
              id="apply-workExperience"
              aria-invalid={errors.workExperience ? true : undefined}
              aria-describedby={
                errors.workExperience
                  ? "apply-workExperience-error"
                  : undefined
              }
              className={fieldSelectTriggerClass}
            >
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent position="popper">
              {WORK_EXPERIENCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="apply-workExperience-error">
            {errors.workExperience}
          </FieldError>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="apply-educationLevel" required>
            Education level
          </FieldLabel>
          <Select
            value={form.educationLevel}
            onValueChange={(value) => update("educationLevel", value)}
          >
            <SelectTrigger
              id="apply-educationLevel"
              aria-invalid={errors.educationLevel ? true : undefined}
              aria-describedby={
                errors.educationLevel
                  ? "apply-educationLevel-error"
                  : undefined
              }
              className={fieldSelectTriggerClass}
            >
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent position="popper">
              {EDUCATION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="apply-educationLevel-error">
            {errors.educationLevel}
          </FieldError>
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel htmlFor="apply-coverLetter">Cover letter</FieldLabel>
        <Textarea
          id="apply-coverLetter"
          name="coverLetter"
          rows={6}
          placeholder="Tell us why you are a strong fit for this role"
          value={form.coverLetter}
          onChange={(event) => update("coverLetter", event.target.value)}
          className={fieldTextareaClass}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="apply-cv" required>
          CV upload
        </FieldLabel>
        <Input
          id="apply-cv"
          name="cv"
          type="file"
          ref={cvRef}
          accept={ACCEPT_ATTRIBUTE}
          onChange={() => clearFileError("cv")}
          aria-invalid={errors.cv ? true : undefined}
          aria-describedby={errors.cv ? "apply-cv-error" : "apply-cv-note"}
          className={fileInputClass}
        />
        <p id="apply-cv-note" className="text-xs font-semibold text-concrete-600">
          PDF, DOC or DOCX, maximum 5 MB.
        </p>
        <FieldError id="apply-cv-error">{errors.cv}</FieldError>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="apply-supporting">
          Supporting document (optional)
        </FieldLabel>
        <Input
          id="apply-supporting"
          name="supporting"
          type="file"
          ref={supportingRef}
          accept={ACCEPT_ATTRIBUTE}
          onChange={() => clearFileError("supporting")}
          aria-invalid={errors.supporting ? true : undefined}
          aria-describedby={
            errors.supporting ? "apply-supporting-error" : "apply-supporting-note"
          }
          className={fileInputClass}
        />
        <p
          id="apply-supporting-note"
          className="text-xs font-semibold text-concrete-600"
        >
          Certificates or a portfolio. PDF, DOC or DOCX, maximum 5 MB.
        </p>
        <FieldError id="apply-supporting-error">{errors.supporting}</FieldError>
      </FieldGroup>

      <div
        className={cn(
          "flex items-start gap-3 rounded-xl bg-concrete-50 p-4",
          errors.consent && "ring-1 ring-red-300"
        )}
      >
        <Checkbox
          id="apply-consent"
          checked={form.consent}
          onCheckedChange={(checked) => update("consent", checked === true)}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "apply-consent-error" : undefined}
          className="mt-0.5 size-5 rounded-md"
        />
        <label
          htmlFor="apply-consent"
          className="text-sm font-medium leading-relaxed text-concrete-800"
        >
          I consent to Camel Cement storing my details and documents so the
          recruitment team can process this application.
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
        </label>
      </div>
      <FieldError id="apply-consent-error">{errors.consent}</FieldError>

      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-full bg-camel-green-700 px-7 font-bold text-white hover:bg-camel-green-800 sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2Icon className="animate-spin" aria-hidden="true" />
            Submitting application...
          </>
        ) : (
          "Submit application"
        )}
      </Button>
    </form>
  );
}
