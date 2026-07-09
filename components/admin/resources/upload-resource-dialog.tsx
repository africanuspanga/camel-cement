"use client";

import * as React from "react";
import { FileUp, Upload } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { uploadResource } from "@/lib/admin/resource-actions";
import { products } from "@/lib/products";
import {
  ALLOWED_RESOURCE_EXTENSIONS,
  fileExtension,
  formatFileSize,
  MAX_RESOURCE_FILE_BYTES,
  RESOURCE_CATEGORIES,
  RESOURCE_FILE_ACCEPT,
  RESOURCE_LANGUAGES,
} from "@/lib/resources";

const NO_PRODUCT = "none";

const INITIAL = {
  title: "",
  category: "",
  productSlug: NO_PRODUCT,
  language: "en",
  version: "",
  description: "",
};

/** "camel-42-5r_datasheet.pdf" → "Camel 42 5r datasheet" */
function titleFromFileName(fileName: string): string {
  const ext = fileExtension(fileName);
  const base = ext ? fileName.slice(0, -(ext.length + 1)) : fileName;
  const words = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function UploadResourceDialog() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(INITIAL);
  const [file, setFile] = React.useState<File | null>(null);
  const [pending, startTransition] = React.useTransition();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof INITIAL>(
    key: K,
    value: (typeof INITIAL)[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm(INITIAL);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (!selected) return;

    const ext = fileExtension(selected.name);
    if (!ALLOWED_RESOURCE_EXTENSIONS[ext]) {
      toast.error("Unsupported file type", {
        description:
          "Upload PDF, Word, Excel, PowerPoint, PNG or JPG files only.",
      });
      setFile(null);
      event.target.value = "";
      return;
    }
    if (selected.size > MAX_RESOURCE_FILE_BYTES) {
      toast.error("File too large", {
        description: `The maximum size is 25 MB — this file is ${(
          selected.size /
          (1024 * 1024)
        ).toFixed(1)} MB.`,
      });
      setFile(null);
      event.target.value = "";
      return;
    }
    // Auto-fill the title from the filename when it is still empty.
    setForm((prev) =>
      prev.title.trim()
        ? prev
        : { ...prev, title: titleFromFileName(selected.name) }
    );
  };

  const submit = () => {
    if (!file) return;
    const data = new FormData();
    data.set("file", file);
    data.set("title", form.title);
    data.set("category", form.category);
    data.set(
      "productSlug",
      form.productSlug === NO_PRODUCT ? "" : form.productSlug
    );
    data.set("language", form.language);
    data.set("version", form.version);
    data.set("description", form.description);

    startTransition(async () => {
      const result = await uploadResource(data);
      if (result.ok) {
        toast.success("Document uploaded", {
          description: `${form.title} is now live in the public download centre.`,
        });
        reset();
        setOpen(false);
      } else {
        toast.error("Upload failed", { description: result.error });
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-camel-green-700 px-4 font-semibold hover:bg-camel-green-800">
          <Upload className="size-4" aria-hidden />
          Upload document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            Published documents appear immediately in the public resources
            library. PDF, Word, Excel, PowerPoint, PNG or JPG up to 25 MB.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="resource-file">File</Label>
            <label
              htmlFor="resource-file"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-concrete-300 bg-concrete-50 px-4 py-3 transition-colors hover:border-camel-green-400"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-camel-green-50 text-camel-green-700">
                <FileUp className="size-4.5" aria-hidden />
              </span>
              <span className="min-w-0 text-sm">
                {file ? (
                  <>
                    <span className="block truncate font-medium text-foreground">
                      {file.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatFileSize(Math.round(file.size / 1024))}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block font-medium text-foreground">
                      Choose a file
                    </span>
                    <span className="text-muted-foreground">
                      PDF, DOCX, XLSX, PPTX, PNG or JPG
                    </span>
                  </>
                )}
              </span>
            </label>
            <Input
              ref={fileInputRef}
              id="resource-file"
              type="file"
              accept={RESOURCE_FILE_ACCEPT}
              onChange={onFileChange}
              className="sr-only"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="resource-title">Title</Label>
            <Input
              id="resource-title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="e.g. Camel 42.5R Technical Datasheet"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-category">Category</Label>
            <Select
              value={form.category || undefined}
              onValueChange={(value) => set("category", value)}
            >
              <SelectTrigger id="resource-category" className="h-11 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {RESOURCE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-product">
              Product{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Select
              value={form.productSlug}
              onValueChange={(value) => set("productSlug", value)}
            >
              <SelectTrigger id="resource-product" className="h-11 w-full">
                <SelectValue placeholder="No specific product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PRODUCT}>No specific product</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.slug} value={product.slug}>
                    {product.friendlyName} ({product.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-language">Language</Label>
            <Select
              value={form.language}
              onValueChange={(value) => set("language", value)}
            >
              <SelectTrigger id="resource-language" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_LANGUAGES.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-version">
              Version{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="resource-version"
              value={form.version}
              onChange={(event) => set("version", event.target.value)}
              placeholder="e.g. v2.1"
              className="h-11"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="resource-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="resource-description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="One or two sentences shown on the public download card."
              rows={3}
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
            disabled={pending || !file || !form.title.trim() || !form.category}
            className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
          >
            {pending ? "Uploading…" : "Upload document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
