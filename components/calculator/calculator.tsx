"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BoxIcon,
  BrickWallIcon,
  Columns3Icon,
  Grid3x3Icon,
  LandmarkIcon,
  LayoutGridIcon,
  PaintRollerIcon,
  RectangleHorizontalIcon,
  SquareIcon,
  SquareStackIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProduct } from "@/lib/products";
import {
  CALCULATOR_DISCLAIMER,
  calculatorInputSchemas,
  calculatorList,
  calculatorTypes,
  defaultInputsFor,
  defaultOptionsFor,
  getCalculatorConfig,
  recommendedProduct,
  type CalculationResult,
  type CalculatorConfig,
  type CalculatorInputs,
  type CalculatorOptions,
  type CalculatorType,
} from "@/lib/calculators";
import { NumberField, SelectField } from "@/components/calculator/fields";
import { ResultCard } from "@/components/calculator/result-card";

const typeIcons: Record<CalculatorType, LucideIcon> = {
  "concrete-slab": SquareIcon,
  foundation: LandmarkIcon,
  column: Columns3Icon,
  beam: RectangleHorizontalIcon,
  "general-concrete": BoxIcon,
  "block-laying": BrickWallIcon,
  "brick-laying": Grid3x3Icon,
  "wall-plastering": PaintRollerIcon,
  "floor-screed": SquareStackIcon,
  paving: LayoutGridIcon,
};

/** Maps a ?product= slug (or direct type) to a sensible calculator type. */
function typeFromParam(param: string | null): CalculatorType {
  if (param && (calculatorTypes as readonly string[]).includes(param)) {
    return param as CalculatorType;
  }
  switch (param) {
    case "42-5r":
      return "block-laying";
    case "42-5n":
      return "concrete-slab";
    case "32-5r":
      return "wall-plastering";
    case "32-5n":
      return "paving";
    default:
      return "concrete-slab";
  }
}

type RawInputs = Record<string, string>;

function initialInputsByType(): Record<CalculatorType, RawInputs> {
  const state = {} as Record<CalculatorType, RawInputs>;
  for (const type of calculatorTypes) {
    const defaults = defaultInputsFor(type);
    const raw: RawInputs = {};
    for (const field of getCalculatorConfig(type).fields) {
      raw[field.key] =
        defaults[field.key] !== undefined ? String(defaults[field.key]) : "";
    }
    state[type] = raw;
  }
  return state;
}

function initialOptionsByType(): Record<CalculatorType, CalculatorOptions> {
  const state = {} as Record<CalculatorType, CalculatorOptions>;
  for (const type of calculatorTypes) {
    state[type] = defaultOptionsFor(type);
  }
  return state;
}

function parseInputs(
  config: CalculatorConfig,
  raw: RawInputs
): CalculatorInputs | null {
  const parsed: CalculatorInputs = {};
  for (const field of config.fields) {
    const value = Number(raw[field.key]);
    if (raw[field.key] === "" || !Number.isFinite(value)) return null;
    parsed[field.key] = value;
  }
  const checked = calculatorInputSchemas[config.type].safeParse(parsed);
  return checked.success ? checked.data : null;
}

function buildSummary(
  config: CalculatorConfig,
  raw: RawInputs,
  options: CalculatorOptions,
  result: CalculationResult,
  productName: string
): string {
  const lines: string[] = [
    "Camel Cement material estimate",
    `Project type: ${config.label}`,
  ];
  for (const field of config.fields) {
    lines.push(`${field.label}: ${raw[field.key]} ${field.unit}`);
  }
  for (const select of config.selects) {
    const choice = select.choices.find((c) => c.value === options[select.key]);
    lines.push(`${select.label}: ${choice?.label ?? options[select.key]}`);
  }
  lines.push(
    "",
    `Estimated cement: ${result.cementBags} bags of 50 kg (${result.cementKg} kg)`,
    `Estimated sand: ${result.sandM3} m3`
  );
  if (result.aggregateM3 !== undefined) {
    lines.push(`Estimated aggregate: ${result.aggregateM3} m3`);
  }
  if (result.areaM2 !== undefined) {
    lines.push(`Area: ${result.areaM2} m2`);
  }
  if (result.wetVolumeM3 !== undefined) {
    lines.push(`Wet volume: ${result.wetVolumeM3} m3`);
  }
  lines.push(
    `Recommended product: ${productName}`,
    "",
    "Preliminary planning estimate only. Final quantities should be confirmed by a qualified professional.",
    "Calculated with the Camel Cement calculator."
  );
  return lines.join("\n");
}

export function Calculator() {
  const searchParams = useSearchParams();
  const [activeType, setActiveType] = useState<CalculatorType>(() =>
    typeFromParam(searchParams.get("product"))
  );
  const [inputsByType, setInputsByType] = useState(initialInputsByType);
  const [optionsByType, setOptionsByType] = useState(initialOptionsByType);

  const config = getCalculatorConfig(activeType);
  const rawInputs = inputsByType[activeType];
  const options = optionsByType[activeType];

  const parsedInputs = useMemo(
    () => parseInputs(config, rawInputs),
    [config, rawInputs]
  );

  const result = useMemo(
    () => (parsedInputs ? config.calculate(parsedInputs, options) : null),
    [config, parsedInputs, options]
  );

  const recommendation = useMemo(
    () => recommendedProduct(activeType, options),
    [activeType, options]
  );

  const product = getProduct(recommendation.slug);
  const productName = product
    ? `Camel Cement ${product.grade}`
    : "Camel Cement";

  const summary = useMemo(
    () =>
      result
        ? buildSummary(config, rawInputs, options, result, productName)
        : "",
    [config, rawInputs, options, result, productName]
  );

  // Label/value pairs of the current inputs and mix settings, used by the
  // branded PDF download in the result card.
  const details = useMemo(() => {
    const rows: { label: string; value: string }[] = [];
    for (const field of config.fields) {
      rows.push({
        label: field.label,
        value: `${rawInputs[field.key]} ${field.unit}`,
      });
    }
    for (const select of config.selects) {
      const choice = select.choices.find(
        (c) => c.value === options[select.key]
      );
      rows.push({
        label: select.label,
        value: choice?.label ?? options[select.key],
      });
    }
    return rows;
  }, [config, rawInputs, options]);

  // Debounced fire-and-forget analytics persist. Failures are ignored.
  useEffect(() => {
    if (!result || !parsedInputs) return;
    const timer = setTimeout(() => {
      try {
        void fetch("/api/calculator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            calculatorType: config.type,
            inputs: parsedInputs,
            options,
            results: result,
            recommendedProduct: recommendation.slug,
          }),
        }).catch(() => {});
      } catch {
        // Analytics must never interrupt the calculator.
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [config.type, parsedInputs, options, result, recommendation.slug]);

  const setFieldValue = (key: string, value: string) => {
    setInputsByType((previous) => ({
      ...previous,
      [activeType]: { ...previous[activeType], [key]: value },
    }));
  };

  const setOptionValue = (key: string, value: string) => {
    setOptionsByType((previous) => ({
      ...previous,
      [activeType]: { ...previous[activeType], [key]: value },
    }));
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start xl:gap-14">
      {/* Left: type picker + input form */}
      <div className="space-y-8">
        <fieldset>
          <legend className="text-sm font-[650] text-concrete-950">
            What are you building?
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {calculatorList.map((item) => {
              const Icon = typeIcons[item.type];
              const active = item.type === activeType;
              return (
                <button
                  key={item.type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveType(item.type)}
                  className={cn(
                    "flex flex-col items-start gap-2.5 rounded-2xl border bg-white p-4 text-left transition-all",
                    active
                      ? "border-camel-green-700 bg-camel-green-50 shadow-[inset_0_0_0_1px_var(--color-camel-green-700)]"
                      : "border-concrete-200 hover:border-camel-green-600 hover:shadow-card"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-camel-green-700 text-white"
                        : "bg-concrete-100 text-concrete-600"
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4.5" />
                  </span>
                  <span className="text-sm font-bold leading-snug text-concrete-950">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="rounded-3xl border border-concrete-200 bg-white p-6 shadow-card md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-h3 text-concrete-950">{config.label}</h2>
              <p className="mt-1 text-concrete-800">{config.description}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {config.fields.map((field) => (
              <NumberField
                key={`${config.type}-${field.key}`}
                field={field}
                value={rawInputs[field.key] ?? ""}
                onChange={(value) => setFieldValue(field.key, value)}
              />
            ))}
          </div>

          <div className="mt-7 border-t border-concrete-200 pt-6">
            <p className="text-sm font-[650] text-concrete-950">
              Mix and allowances
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {config.selects.map((select) => (
                <SelectField
                  key={`${config.type}-${select.key}`}
                  select={select}
                  value={options[select.key] ?? select.defaultValue}
                  onChange={(value) => setOptionValue(select.key, value)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: live estimate (sticky on desktop, stacked on mobile) */}
      <div
        id="calc-result"
        className="scroll-mt-32 space-y-4 lg:sticky lg:top-24"
      >
        <ResultCard
          config={config}
          result={result}
          recommendation={recommendation}
          summary={summary}
          details={details}
        />
        <p className="rounded-2xl border border-concrete-200 bg-white p-4 text-sm leading-relaxed text-concrete-800">
          <strong className="font-bold text-concrete-950">Important:</strong>{" "}
          {CALCULATOR_DISCLAIMER}
        </p>
      </div>

      {/* Mobile: sticky live result bar so the estimate is never missed */}
      {result ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-camel-green-800 bg-camel-green-900 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-raised lg:hidden print:hidden">
          {/* pr keeps the bar clear of the floating chat camel */}
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 pr-20 sm:pr-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                Estimated requirement
              </p>
              <p className="text-xl font-extrabold tabular-nums leading-tight text-camel-yellow-500">
                {result.cementBags.toLocaleString("en-US")} bags
                <span className="ml-2 text-xs font-semibold text-white/76">
                  of 50 kg
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("calc-result")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="h-11 shrink-0 rounded-full bg-white px-5 text-sm font-bold text-camel-green-800 transition-colors hover:bg-concrete-100"
            >
              View estimate
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
