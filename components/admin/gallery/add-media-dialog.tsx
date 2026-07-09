"use client";

import * as React from "react";
import { LinkIcon, PlusIcon, UploadIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addGalleryLink, uploadGalleryMedia } from "@/lib/admin/gallery-actions";

const NEW_CATEGORY = "__new__";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function CategoryPicker({
  id,
  categories,
  value,
  newValue,
  onValueChange,
  onNewValueChange,
}: {
  id: string;
  categories: string[];
  value: string;
  newValue: string;
  onValueChange: (value: string) => void;
  onNewValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Category</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="h-11 w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
          <SelectItem value={NEW_CATEGORY}>New category…</SelectItem>
        </SelectContent>
      </Select>
      {value === NEW_CATEGORY ? (
        <Input
          aria-label="New category name"
          value={newValue}
          onChange={(event) => onNewValueChange(event.target.value)}
          placeholder="e.g. Community"
          className="h-11"
        />
      ) : null}
    </div>
  );
}

export function AddMediaDialog({ categories }: { categories: string[] }) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  // Upload mode
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [uploadCategory, setUploadCategory] = React.useState("");
  const [uploadNewCategory, setUploadNewCategory] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Link mode
  const [linkTitle, setLinkTitle] = React.useState("");
  const [linkSrc, setLinkSrc] = React.useState("");
  const [linkKind, setLinkKind] = React.useState<"image" | "video">("image");
  const [linkCategory, setLinkCategory] = React.useState("");
  const [linkNewCategory, setLinkNewCategory] = React.useState("");

  const reset = () => {
    setFile(null);
    setUploadTitle("");
    setUploadCategory("");
    setUploadNewCategory("");
    setLinkTitle("");
    setLinkSrc("");
    setLinkKind("image");
    setLinkCategory("");
    setLinkNewCategory("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resolveCategory = (selected: string, custom: string) =>
    selected === NEW_CATEGORY ? custom.trim() : selected;

  const uploadCategoryValue = resolveCategory(uploadCategory, uploadNewCategory);
  const linkCategoryValue = resolveCategory(linkCategory, linkNewCategory);

  const submitUpload = () => {
    if (!file) return;
    const isVideo = file.type === "video/mp4";
    if (!file.type.startsWith("image/") && !isVideo) {
      toast.error("Unsupported file", {
        description: "Choose an image or an MP4 video.",
      });
      return;
    }
    if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
      toast.error("File too large", {
        description: isVideo
          ? "Videos must be 50 MB or smaller."
          : "Images must be 10 MB or smaller.",
      });
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", uploadTitle);
    formData.set("category", uploadCategoryValue);

    startTransition(async () => {
      const result = await uploadGalleryMedia(formData);
      if (result.ok) {
        toast.success("Media uploaded", {
          description: `${uploadTitle} is now live in the public gallery.`,
        });
        reset();
        setOpen(false);
      } else {
        toast.error("Could not upload media", { description: result.error });
      }
    });
  };

  const submitLink = () => {
    startTransition(async () => {
      const result = await addGalleryLink({
        title: linkTitle,
        src: linkSrc,
        kind: linkKind,
        category: linkCategoryValue,
      });
      if (result.ok) {
        toast.success("Media added", {
          description: `${linkTitle} is now live in the public gallery.`,
        });
        reset();
        setOpen(false);
      } else {
        toast.error("Could not add media", { description: result.error });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-camel-green-700 px-4 font-semibold hover:bg-camel-green-800">
          <PlusIcon className="size-4" aria-hidden />
          Add media
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add media</DialogTitle>
          <DialogDescription>
            Upload a file to storage or link media that already exists. New
            items appear immediately in the public gallery.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList className="w-full">
            <TabsTrigger value="upload">
              <UploadIcon aria-hidden />
              Upload file
            </TabsTrigger>
            <TabsTrigger value="link">
              <LinkIcon aria-hidden />
              Link existing
            </TabsTrigger>
          </TabsList>

          {/* ── Upload ── */}
          <TabsContent value="upload" className="mt-3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gallery-file">File</Label>
              <Input
                ref={fileInputRef}
                id="gallery-file"
                type="file"
                accept="image/*,video/mp4"
                className="h-11 pt-2.5"
                onChange={(event) =>
                  setFile(event.target.files?.[0] ?? null)
                }
              />
              <p className="text-xs text-muted-foreground">
                Images up to 10 MB, MP4 videos up to 50 MB.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-upload-title">Title</Label>
              <Input
                id="gallery-upload-title"
                value={uploadTitle}
                onChange={(event) => setUploadTitle(event.target.value)}
                placeholder="e.g. Bridge deck pour, Kigamboni"
                className="h-11"
              />
            </div>
            <CategoryPicker
              id="gallery-upload-category"
              categories={categories}
              value={uploadCategory}
              newValue={uploadNewCategory}
              onValueChange={setUploadCategory}
              onNewValueChange={setUploadNewCategory}
            />
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                onClick={submitUpload}
                disabled={
                  pending ||
                  !file ||
                  uploadTitle.trim().length < 2 ||
                  uploadCategoryValue.length < 2
                }
                className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
              >
                {pending ? "Uploading…" : "Upload media"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ── Link ── */}
          <TabsContent value="link" className="mt-3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gallery-link-src">Site path or URL</Label>
              <Input
                id="gallery-link-src"
                value={linkSrc}
                onChange={(event) => setLinkSrc(event.target.value)}
                placeholder="/gallery/photo.jpg or https://…"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-link-title">Title</Label>
              <Input
                id="gallery-link-title"
                value={linkTitle}
                onChange={(event) => setLinkTitle(event.target.value)}
                placeholder="e.g. Camel Cement brand film"
                className="h-11"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gallery-link-kind">Kind</Label>
                <Select
                  value={linkKind}
                  onValueChange={(value) =>
                    setLinkKind(value as "image" | "video")
                  }
                >
                  <SelectTrigger id="gallery-link-kind" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CategoryPicker
                id="gallery-link-category"
                categories={categories}
                value={linkCategory}
                newValue={linkNewCategory}
                onValueChange={setLinkCategory}
                onNewValueChange={setLinkNewCategory}
              />
            </div>
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                onClick={submitLink}
                disabled={
                  pending ||
                  linkTitle.trim().length < 2 ||
                  linkSrc.trim().length < 2 ||
                  linkCategoryValue.length < 2
                }
                className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
              >
                {pending ? "Saving…" : "Add media"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
