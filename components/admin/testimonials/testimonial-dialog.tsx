"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createTestimonial,
  updateTestimonial,
} from "@/lib/admin/testimonial-actions";

export interface TestimonialRecord {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  source: string;
  published: boolean;
}

const RATING_OPTIONS = ["5", "4.5", "4", "3.5", "3"] as const;
const QUOTE_MAX = 500;

type FormState = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: string;
  source: string;
  published: boolean;
};

const EMPTY: FormState = {
  name: "",
  role: "",
  company: "",
  quote: "",
  rating: "5",
  source: "google",
  published: true,
};

function toFormState(testimonial?: TestimonialRecord): FormState {
  if (!testimonial) return EMPTY;
  return {
    name: testimonial.name,
    role: testimonial.role ?? "",
    company: testimonial.company ?? "",
    quote: testimonial.quote,
    rating: String(testimonial.rating),
    source: testimonial.source,
    published: testimonial.published,
  };
}

/**
 * Shared add/edit form dialog. Pass `testimonial` to edit an existing row;
 * omit it to create a new one. The form body lives inside DialogContent so
 * Radix remounts it with fresh state every time the dialog opens.
 */
export function TestimonialDialog({
  open,
  onOpenChange,
  testimonial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: TestimonialRecord;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <TestimonialForm
          testimonial={testimonial}
          close={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function TestimonialForm({
  testimonial,
  close,
}: {
  testimonial?: TestimonialRecord;
  close: () => void;
}) {
  const [form, setForm] = React.useState<FormState>(() =>
    toFormState(testimonial)
  );
  const [pending, startTransition] = React.useTransition();
  const editing = Boolean(testimonial);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    startTransition(async () => {
      const input = {
        name: form.name,
        role: form.role || undefined,
        company: form.company || undefined,
        quote: form.quote,
        rating: Number(form.rating),
        source: form.source,
        published: form.published,
      };
      const result = testimonial
        ? await updateTestimonial(testimonial.id, input)
        : await createTestimonial(input);

      if (result.ok) {
        toast.success(editing ? "Testimonial updated" : "Testimonial added", {
          description: editing
            ? `Changes to ${form.name}'s testimonial are live.`
            : form.published
              ? `${form.name}'s testimonial is now live on the site.`
              : `${form.name}'s testimonial was saved as unpublished.`,
        });
        close();
      } else {
        toast.error(
          editing ? "Could not update testimonial" : "Could not add testimonial",
          { description: result.error }
        );
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editing ? "Edit testimonial" : "Add testimonial"}
        </DialogTitle>
        <DialogDescription>
          Published testimonials appear in the homepage social-proof section.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="testimonial-name">Name</Label>
          <Input
            id="testimonial-name"
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder="e.g. Joseph Mwakasege"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial-role">
            Role{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="testimonial-role"
            value={form.role}
            onChange={(event) => set("role", event.target.value)}
            placeholder="e.g. Site Agent"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial-company">
            Company / location{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="testimonial-company"
            value={form.company}
            onChange={(event) => set("company", event.target.value)}
            placeholder="e.g. Temeke, Dar es Salaam"
            className="h-11"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="testimonial-quote">Quote</Label>
            <span
              className={`text-xs tabular-nums ${
                form.quote.length > QUOTE_MAX
                  ? "font-medium text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {form.quote.length}/{QUOTE_MAX}
            </span>
          </div>
          <Textarea
            id="testimonial-quote"
            value={form.quote}
            onChange={(event) => set("quote", event.target.value)}
            placeholder="What did they say about building with Camel Cement?"
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial-rating">Rating</Label>
          <Select
            value={form.rating}
            onValueChange={(value) => set("rating", value)}
          >
            <SelectTrigger id="testimonial-rating" className="h-11 w-full">
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {RATING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option} stars
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial-source">Source</Label>
          <Select
            value={form.source}
            onValueChange={(value) => set("source", value)}
          >
            <SelectTrigger id="testimonial-source" className="h-11 w-full">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google review</SelectItem>
              <SelectItem value="direct">Direct feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium sm:col-span-2">
          <Switch
            checked={form.published}
            onCheckedChange={(value) => set("published", value)}
            className="data-[state=checked]:bg-camel-green-700"
          />
          Published on the website
        </label>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={close}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={
            pending ||
            !form.name.trim() ||
            !form.quote.trim() ||
            form.quote.length > QUOTE_MAX
          }
          className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Add testimonial"}
        </Button>
      </DialogFooter>
    </>
  );
}

/** "Add testimonial" button + create dialog for the page header. */
export function AddTestimonialDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-10 rounded-full bg-camel-green-700 px-4 font-semibold hover:bg-camel-green-800"
      >
        <Plus className="size-4" aria-hidden />
        Add testimonial
      </Button>
      <TestimonialDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
