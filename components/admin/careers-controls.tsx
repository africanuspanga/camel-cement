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
  DialogTrigger,
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
  createVacancy,
  setVacancyPublished,
  updateApplicationStatus,
} from "@/lib/admin/actions";
import { humaniseStatus } from "@/lib/admin/format";

// ── New vacancy dialog ────────────────────────────────────────────────

const EMPLOYMENT_TYPES = ["Full time", "Part time", "Contract", "Internship"];

const INITIAL = {
  title: "",
  department: "",
  location: "",
  employmentType: "Full time",
  closesAt: "",
  description: "",
};

export function NewVacancyDialog() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(INITIAL);
  const [pending, startTransition] = React.useTransition();

  const set = <K extends keyof typeof INITIAL>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    startTransition(async () => {
      const result = await createVacancy({
        title: form.title,
        department: form.department,
        location: form.location,
        employment_type: form.employmentType,
        closes_at: form.closesAt || undefined,
        description_md: form.description || undefined,
      });
      if (result.ok) {
        toast.success("Vacancy created as draft", {
          description: "Publish it when you are ready to receive applications.",
        });
        setForm(INITIAL);
        setOpen(false);
      } else {
        toast.error("Could not create vacancy", { description: result.error });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-camel-green-700 px-4 font-semibold hover:bg-camel-green-800">
          <Plus className="size-4" aria-hidden />
          New vacancy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New vacancy</DialogTitle>
          <DialogDescription>
            Created unpublished — it only appears on the careers page after you
            publish it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vacancy-title">Job title</Label>
            <Input
              id="vacancy-title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="e.g. Quality Control Technician"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancy-department">Department</Label>
            <Input
              id="vacancy-department"
              value={form.department}
              onChange={(event) => set("department", event.target.value)}
              placeholder="e.g. Production"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancy-location">Location</Label>
            <Input
              id="vacancy-location"
              value={form.location}
              onChange={(event) => set("location", event.target.value)}
              placeholder="e.g. Dar es Salaam"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancy-type">Employment type</Label>
            <Select
              value={form.employmentType}
              onValueChange={(value) => set("employmentType", value)}
            >
              <SelectTrigger id="vacancy-type" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancy-closes">
              Closing date{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="vacancy-closes"
              type="date"
              value={form.closesAt}
              onChange={(event) => set("closesAt", event.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vacancy-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="vacancy-description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Role summary, responsibilities and requirements…"
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={
              pending || !form.title || !form.department || !form.location
            }
            className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
          >
            {pending ? "Saving…" : "Create vacancy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Vacancy publish switch ────────────────────────────────────────────

export function VacancyPublishSwitch({
  id,
  title,
  published,
}: {
  id: string;
  title: string;
  published: boolean;
}) {
  const [checked, setChecked] = React.useState(published);
  const [pending, startTransition] = React.useTransition();

  return (
    <label className="flex items-center gap-2">
      <Switch
        checked={checked}
        disabled={pending}
        aria-label={`${title} published`}
        onCheckedChange={(next) => {
          setChecked(next);
          startTransition(async () => {
            const result = await setVacancyPublished(id, next);
            if (result.ok) {
              toast.success(next ? "Vacancy published" : "Vacancy unpublished", {
                description: title,
              });
            } else {
              setChecked(!next);
              toast.error("Could not update vacancy", {
                description: result.error,
              });
            }
          });
        }}
        className="data-[state=checked]:bg-camel-green-700"
      />
      <span className="text-xs font-medium text-muted-foreground">
        {checked ? "Live" : "Draft"}
      </span>
    </label>
  );
}

// ── Application status select ─────────────────────────────────────────

const APPLICATION_STATUSES = [
  "new",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "reference_check",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
];

export function ApplicationStatusSelect({
  id,
  reference,
  status,
}: {
  id: string;
  reference: string;
  status: string;
}) {
  const [value, setValue] = React.useState(status);
  const [pending, startTransition] = React.useTransition();

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(next) => {
        const previous = value;
        setValue(next);
        startTransition(async () => {
          const result = await updateApplicationStatus(id, next);
          if (result.ok) {
            toast.success(`${reference} moved to ${humaniseStatus(next)}`);
          } else {
            setValue(previous);
            toast.error("Could not update application", {
              description: result.error,
            });
          }
        });
      }}
    >
      <SelectTrigger
        aria-label={`Status for ${reference}`}
        className="h-8 w-40 rounded-full border-concrete-200 text-xs font-semibold"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APPLICATION_STATUSES.map((option) => (
          <SelectItem key={option} value={option}>
            {humaniseStatus(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
