import { cn } from "@/lib/utils";

type Surface = "canvas" | "white" | "deep" | "subtle" | "wash";

const surfaceClasses: Record<Surface, string> = {
  canvas: "bg-concrete-50",
  white: "bg-white",
  deep: "bg-camel-green-900 text-white",
  subtle: "bg-concrete-100",
  wash: "bg-camel-green-50",
};

export function Section({
  surface = "canvas",
  className,
  children,
  id,
}: {
  surface?: Surface;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-12 md:py-20 lg:py-24",
        surfaceClasses[surface],
        className
      )}
    >
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  className,
  onDark = false,
}: {
  children: React.ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-eyebrow",
        onDark ? "text-camel-yellow-500" : "text-camel-green-700",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
  body,
  onDark = false,
  align = "left",
  className,
}: {
  eyebrow?: string;
  heading: string;
  body?: string;
  onDark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-4",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <div
          className={cn(
            "flex items-center gap-2.5",
            align === "center" && "justify-center"
          )}
        >
          <span
            aria-hidden="true"
            className="h-1 w-8 rounded-full bg-camel-yellow-500"
          />
          <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h2
        className={cn(
          "text-h2 text-balance",
          onDark ? "text-white" : "text-concrete-950"
        )}
      >
        {heading}
      </h2>
      {body ? (
        <p
          className={cn(
            "text-lead",
            onDark ? "text-white/76" : "text-concrete-800"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
