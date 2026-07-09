/**
 * Shared resource-library constants and helpers. Plain data only — safe to
 * import from both client and server code.
 */

/** The eight canonical download-centre categories. */
export const RESOURCE_CATEGORIES = [
  "Product brochures",
  "Technical datasheets",
  "Certificates",
  "Safety and handling",
  "Construction guides",
  "Company documents",
  "Sustainability and CSR reports",
  "Media resources",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "sw", label: "Kiswahili" },
] as const;

export const MAX_RESOURCE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

/** Allowed upload extensions and the MIME types browsers report for them. */
export const ALLOWED_RESOURCE_EXTENSIONS: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
};

/** `accept` attribute for the upload file input. */
export const RESOURCE_FILE_ACCEPT = Object.keys(ALLOWED_RESOURCE_EXTENSIONS)
  .map((ext) => `.${ext}`)
  .join(",");

/** Lower-cased extension of a filename, without the dot. */
export function fileExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index + 1).toLowerCase();
}

/** "412 KB", "1.5 MB" from a kilobyte count. */
export function formatFileSize(kb: number | null | undefined): string {
  if (kb === null || kb === undefined || Number.isNaN(kb)) return "—";
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${Math.max(kb, 1)} KB`;
}
