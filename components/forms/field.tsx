import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Shared form styling per the Camel Cement design system:
 * 52px inputs, 12px radius, always-visible labels, green focus ring.
 */

export const fieldInputClass =
  "h-13 rounded-xl border-concrete-300 bg-white px-3.5 text-base text-concrete-950 focus-visible:border-camel-green-700 focus-visible:ring-[4px] focus-visible:ring-camel-green-700/12 aria-invalid:border-red-600 aria-invalid:ring-red-600/15";

export const fieldSelectTriggerClass =
  "h-13 w-full rounded-xl border-concrete-300 bg-white px-3.5 text-base text-concrete-950 data-[size=default]:h-13 focus-visible:border-camel-green-700 focus-visible:ring-[4px] focus-visible:ring-camel-green-700/12 aria-invalid:border-red-600 aria-invalid:ring-red-600/15";

export const fieldTextareaClass =
  "min-h-33 rounded-xl border-concrete-300 bg-white px-3.5 py-3 text-base text-concrete-950 focus-visible:border-camel-green-700 focus-visible:ring-[4px] focus-visible:ring-camel-green-700/12 aria-invalid:border-red-600 aria-invalid:ring-red-600/15 resize-y";

export function FieldLabel({
  htmlFor,
  required,
  children,
  className,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn("text-sm font-semibold text-concrete-950", className)}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-red-600">
          *
        </span>
      ) : null}
    </Label>
  );
}

export function FieldError({
  id,
  children,
}: {
  id: string;
  children?: string;
}) {
  if (!children) return null;
  return (
    <p id={id} className="text-sm font-medium text-red-600" role="alert">
      {children}
    </p>
  );
}

export function FieldGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

/** Hidden honeypot field. Bots fill it, humans never see it. */
export function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor="website-field">Website</label>
      <input
        id="website-field"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/**
 * Focusable error summary shown at the top of a form after a failed submit.
 */
export function ErrorSummary({
  errors,
  summaryRef,
}: {
  errors: string[];
  summaryRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (errors.length === 0) return null;
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-label="There is a problem with the form"
      className="rounded-xl border border-red-300 bg-red-50 p-4 outline-none focus-visible:ring-[4px] focus-visible:ring-red-600/15"
    >
      <p className="text-sm font-bold text-red-700">
        Please fix the following before continuing:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
