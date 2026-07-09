"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";

interface TalentFormState {
  fullName: string;
  email: string;
  phone: string;
  interests: string;
  consent: boolean;
  website: string; // Honeypot, must stay empty
}

const initialState: TalentFormState = {
  fullName: "",
  email: "",
  phone: "",
  interests: "",
  consent: false,
  website: "",
};

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const CV_EXTENSIONS = [".pdf", ".doc", ".docx"];

export function TalentForm() {
  const [form, setForm] = useState<TalentFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const cvRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof TalentFormState>(
    key: K,
    value: TalentFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.consent) {
      toast.error("Please confirm consent before submitting your profile.");
      return;
    }
    const cvFile = cvRef.current?.files?.[0] ?? null;
    if (cvFile && cvFile.size > 0) {
      const name = cvFile.name.toLowerCase();
      if (!CV_EXTENSIONS.some((ext) => name.endsWith(ext))) {
        toast.error("Only PDF, DOC or DOCX files are accepted for the CV.");
        return;
      }
      if (cvFile.size > MAX_CV_BYTES) {
        toast.error("The CV must be 5 MB or smaller.");
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.set("fullName", form.fullName.trim());
      payload.set("email", form.email.trim());
      payload.set("phone", form.phone.trim());
      payload.set("interests", form.interests.trim());
      payload.set("consent", String(form.consent));
      payload.set("website", form.website);
      if (cvFile && cvFile.size > 0) payload.set("cv", cvFile);

      const response = await fetch("/api/careers", {
        method: "POST",
        body: payload,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        toast.error(
          "Your profile could not be submitted. Please check the details and try again."
        );
        return;
      }
      setSubmitted(true);
      toast.success(
        "Thank you. Your profile has been received by the recruitment team."
      );
    } catch {
      toast.error(
        "Your profile could not be submitted. Please try again or contact us directly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-[24px] border border-camel-green-200 bg-camel-green-50 px-8 py-14 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-white text-camel-green-700 shadow-[0_1px_2px_rgba(20,31,23,0.05)]">
          <CheckCircle2Icon className="size-6" aria-hidden="true" />
        </div>
        <p className="max-w-md text-balance text-lg font-bold text-concrete-950">
          Thank you. Your profile has been received.
        </p>
        <p className="max-w-md text-sm text-concrete-800">
          The recruitment team can review your details when a relevant
          opportunity becomes available.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[24px] border border-concrete-200 bg-white p-7 shadow-card md:p-9"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="talent-name">Full name</Label>
          <Input
            id="talent-name"
            required
            autoComplete="name"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="talent-email">Email</Label>
          <Input
            id="talent-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="talent-phone">Phone</Label>
        <Input
          id="talent-phone"
          type="tel"
          required
          autoComplete="tel"
          value={form.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="talent-interests">Areas of interest</Label>
        <Textarea
          id="talent-interests"
          required
          rows={4}
          placeholder="For example: quality control, logistics, sales, engineering, finance"
          value={form.interests}
          onChange={(event) => update("interests", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="talent-cv">CV upload (optional)</Label>
        <Input
          id="talent-cv"
          name="cv"
          type="file"
          ref={cvRef}
          accept=".pdf,.doc,.docx"
          aria-describedby="talent-cv-note"
          className="h-13 rounded-xl border-concrete-300 bg-white px-3.5 text-sm text-concrete-800 file:mr-3 file:h-full file:border-0 file:bg-transparent file:font-semibold file:text-camel-green-700 focus-visible:border-camel-green-700 focus-visible:ring-[4px] focus-visible:ring-camel-green-700/12"
        />
        <p id="talent-cv-note" className="text-xs font-semibold text-concrete-600">
          PDF, DOC or DOCX, maximum 5 MB.
        </p>
      </div>

      {/* Honeypot field, hidden from people and screen readers */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="talent-website">Website</label>
        <input
          id="talent-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-concrete-50 p-4">
        <Checkbox
          id="talent-consent"
          checked={form.consent}
          onCheckedChange={(checked) => update("consent", checked === true)}
        />
        <Label
          htmlFor="talent-consent"
          className="text-sm font-medium leading-relaxed text-concrete-800"
        >
          I consent to Camel Cement storing my details so the recruitment team
          can contact me about future opportunities.
        </Label>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800 sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2Icon className="animate-spin" aria-hidden="true" />
            Submitting...
          </>
        ) : (
          "Join Talent Community"
        )}
      </Button>
    </form>
  );
}
