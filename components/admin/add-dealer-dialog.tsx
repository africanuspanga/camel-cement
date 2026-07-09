"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { addDealer } from "@/lib/admin/actions";
import { regions } from "@/lib/site";

const INITIAL = {
  name: "",
  region: "",
  district: "",
  phone: "",
  whatsapp: "",
  delivery: false,
  collection: true,
};

export function AddDealerDialog() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(INITIAL);
  const [pending, startTransition] = React.useTransition();

  const set = <K extends keyof typeof INITIAL>(key: K, value: (typeof INITIAL)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    startTransition(async () => {
      const result = await addDealer({
        name: form.name,
        region: form.region,
        district: form.district || undefined,
        phone: form.phone,
        whatsapp: form.whatsapp || undefined,
        delivery_available: form.delivery,
        collection_available: form.collection,
      });
      if (result.ok) {
        toast.success("Dealer added", {
          description: `${form.name} is now available in the public locator.`,
        });
        setForm(INITIAL);
        setOpen(false);
      } else {
        toast.error("Could not add dealer", { description: result.error });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-camel-green-700 px-4 font-semibold hover:bg-camel-green-800">
          <Plus className="size-4" aria-hidden />
          Add dealer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add dealer</DialogTitle>
          <DialogDescription>
            New dealers appear immediately in the public dealer locator.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dealer-name">Dealer name</Label>
            <Input
              id="dealer-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="e.g. Mwenge Building Supplies"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealer-region">Region</Label>
            <Select
              value={form.region || undefined}
              onValueChange={(value) => set("region", value)}
            >
              <SelectTrigger id="dealer-region" className="h-11 w-full">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealer-district">District</Label>
            <Input
              id="dealer-district"
              value={form.district}
              onChange={(event) => set("district", event.target.value)}
              placeholder="e.g. Kinondoni"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealer-phone">Phone</Label>
            <Input
              id="dealer-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => set("phone", event.target.value)}
              placeholder="+255 7xx xxx xxx"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealer-whatsapp">
              WhatsApp{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="dealer-whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(event) => set("whatsapp", event.target.value)}
              placeholder="+255 7xx xxx xxx"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:gap-8">
            <label className="flex items-center gap-2.5 text-sm font-medium">
              <Checkbox
                checked={form.delivery}
                onCheckedChange={(value) => set("delivery", value === true)}
              />
              Offers delivery
            </label>
            <label className="flex items-center gap-2.5 text-sm font-medium">
              <Checkbox
                checked={form.collection}
                onCheckedChange={(value) => set("collection", value === true)}
              />
              Offers collection
            </label>
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
            disabled={pending || !form.name || !form.region || !form.phone}
            className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
          >
            {pending ? "Saving…" : "Add dealer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
