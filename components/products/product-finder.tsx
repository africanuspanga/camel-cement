"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProduct, type Product } from "@/lib/products";
import { regions } from "@/lib/site";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalculatorIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  HeadsetIcon,
  RotateCcwIcon,
} from "lucide-react";

/* ── Answer types ─────────────────────────────────────────────── */

export type BuildingValue =
  | "home"
  | "commercial"
  | "road"
  | "blocks"
  | "industrial"
  | "public";

export type ActivityValue =
  | "structural"
  | "foundations"
  | "blocks"
  | "masonry"
  | "plastering"
  | "screed"
  | "paving"
  | "stabilisation"
  | "ready-mix"
  | "repairs";

export type StrengthValue = "rapid" | "standard" | "not-sure";

export type SpecificationValue = "yes" | "no";

export interface FinderAnswers {
  building: BuildingValue;
  activity: ActivityValue;
  strength: StrengthValue;
  specification: SpecificationValue;
  region: string;
}

export interface Recommendation {
  slug: string;
  reasons: string[];
}

/* ── Pure recommendation logic (unit testable) ────────────────── */

export function recommendProduct(answers: FinderAnswers): Recommendation {
  const { building, activity, strength, region } = answers;
  const rapid = strength === "rapid";
  const largeScale =
    building === "commercial" ||
    building === "road" ||
    building === "industrial" ||
    building === "public";

  let slug: string;
  const reasons: string[] = [];

  switch (activity) {
    case "ready-mix":
      slug = "42-5r";
      reasons.push(
        "Ready-mix concrete production relies on the high early strength and dense concrete performance that Grade 42.5R is developed for."
      );
      break;
    case "structural":
      if (rapid) {
        slug = "42-5r";
        reasons.push(
          "Rapid early strength development keeps formwork cycles short and supports efficient progress on structural columns, beams and slabs."
        );
      } else {
        slug = "42-5n";
        reasons.push(
          "Strong long-term strength development and versatile structural performance suit columns, beams and slabs without a rapid-hardening requirement."
        );
      }
      break;
    case "blocks":
      if (rapid) {
        slug = "42-5r";
        reasons.push(
          "Strong early strength development supports faster demoulding and higher daily output in block and precast production."
        );
      } else {
        slug = "42-5n";
        reasons.push(
          "Dependable performance for precast production delivers consistent results across block and brick work."
        );
      }
      break;
    case "foundations":
      if (largeScale) {
        slug = "42-5n";
        reasons.push(
          "Foundations for commercial and infrastructure projects benefit from the strong long-term strength development of Grade 42.5N."
        );
      } else {
        slug = "32-5r";
        reasons.push(
          "A practical and economical choice for standard home foundations, with consistent and durable results."
        );
      }
      break;
    case "masonry":
    case "plastering":
    case "screed":
      slug = "32-5r";
      reasons.push(
        "All-purpose workability and consistent performance make this grade well suited to masonry, mortar, plastering and floor screed work."
      );
      break;
    case "paving":
      if (building === "road") {
        slug = "32-5n";
        reasons.push(
          "High workability and controlled heat development suit paving carried out as part of road and infrastructure work."
        );
      } else {
        slug = "32-5r";
        reasons.push(
          "Dependable all-purpose performance covers paving slabs and general paving around homes and buildings."
        );
      }
      break;
    case "stabilisation":
      slug = "32-5n";
      reasons.push(
        "Grade 32.5N is developed for road stabilisation, offering high workability and controlled heat development."
      );
      break;
    case "repairs":
      slug = "32-5n";
      reasons.push(
        "Good handling and controlled heat development make this grade practical for floor repairs and general site concrete."
      );
      break;
  }

  if (strength === "not-sure") {
    reasons.push(
      "If you are unsure about strength requirements, our technical team can confirm the right grade for your mix design."
    );
  }

  if (region) {
    reasons.push(
      `Our sales team can confirm supply and delivery options for projects in ${region}.`
    );
  }

  return { slug, reasons };
}

/* ── Step content ─────────────────────────────────────────────── */

interface Option<T extends string> {
  value: T;
  label: string;
}

const buildingOptions: Option<BuildingValue>[] = [
  { value: "home", label: "Home" },
  { value: "commercial", label: "Commercial building" },
  { value: "road", label: "Road or infrastructure" },
  { value: "blocks", label: "Blocks or precast production" },
  { value: "industrial", label: "Industrial facility" },
  { value: "public", label: "Public or institutional project" },
];

const activityOptions: Option<ActivityValue>[] = [
  { value: "structural", label: "Structural concrete: columns, beams and slabs" },
  { value: "foundations", label: "Foundations" },
  { value: "blocks", label: "Block or brick production" },
  { value: "masonry", label: "Masonry and mortar" },
  { value: "plastering", label: "Plastering" },
  { value: "screed", label: "Floor screed" },
  { value: "paving", label: "Paving" },
  { value: "stabilisation", label: "Road stabilisation" },
  { value: "ready-mix", label: "Ready-mix concrete" },
  { value: "repairs", label: "Repairs" },
];

const strengthOptions: Option<StrengthValue>[] = [
  { value: "rapid", label: "Rapid early strength" },
  { value: "standard", label: "Standard strength development" },
  { value: "not-sure", label: "Not sure" },
];

const specificationOptions: Option<SpecificationValue>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const TOTAL_STEPS = 5;

const stepTitles = [
  "What are you building?",
  "Which construction activity are you carrying out?",
  "Do you need rapid early strength or standard strength development?",
  "Is there an engineer's product specification?",
  "Where is the project located?",
];

/* ── UI helpers ───────────────────────────────────────────────── */

function OptionCards<T extends string>({
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  options: Option<T>[];
  value: T | "";
  onChange: (value: T) => void;
  columns?: 1 | 2;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className={
        columns === 2 ? "grid gap-3 sm:grid-cols-2" : "grid max-w-xl gap-3"
      }
    >
      {options.map((option) => (
        <Label
          key={option.value}
          htmlFor={`${name}-${option.value}`}
          className="flex cursor-pointer items-start gap-3.5 rounded-[18px] border border-concrete-200 bg-white p-5 text-[15px] font-semibold leading-snug text-concrete-950 transition-all duration-[140ms] hover:border-camel-green-200 hover:bg-camel-green-50/40 has-[[data-state=checked]]:border-camel-green-700 has-[[data-state=checked]]:bg-camel-green-50 has-[[data-state=checked]]:shadow-card"
        >
          <RadioGroupItem
            id={`${name}-${option.value}`}
            value={option.value}
            className="mt-0.5 border-concrete-300 bg-white"
          />
          {option.label}
        </Label>
      ))}
    </RadioGroup>
  );
}

/* ── Finder ───────────────────────────────────────────────────── */

export function ProductFinder() {
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [building, setBuilding] = useState<BuildingValue | "">("");
  const [activity, setActivity] = useState<ActivityValue | "">("");
  const [strength, setStrength] = useState<StrengthValue | "">("");
  const [specification, setSpecification] = useState<SpecificationValue | "">(
    ""
  );
  const [region, setRegion] = useState("");

  const answered = [building, activity, strength, specification, region];
  const canContinue = answered[step] !== "";

  function restart() {
    setStep(0);
    setShowResult(false);
    setBuilding("");
    setActivity("");
    setStrength("");
    setSpecification("");
    setRegion("");
  }

  if (showResult && building && activity && strength && specification) {
    const recommendation = recommendProduct({
      building,
      activity,
      strength,
      specification,
      region,
    });
    const product = getProduct(recommendation.slug);
    if (product) {
      return (
        <FinderResult
          product={product}
          reasons={recommendation.reasons}
          hasSpecification={specification === "yes"}
          onRestart={restart}
        />
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <div className="space-y-3">
        <p className="text-label text-camel-green-700">
          Step {step + 1} of {TOTAL_STEPS}
        </p>
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step + 1}
          aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-[220ms] ${
                i <= step ? "bg-camel-green-700" : "bg-concrete-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h2 className="mt-10 text-h3 text-balance text-concrete-950">
        {stepTitles[step]}
      </h2>

      <div className="mt-8">
        {step === 0 && (
          <OptionCards
            name="building"
            options={buildingOptions}
            value={building}
            onChange={setBuilding}
          />
        )}
        {step === 1 && (
          <OptionCards
            name="activity"
            options={activityOptions}
            value={activity}
            onChange={setActivity}
          />
        )}
        {step === 2 && (
          <OptionCards
            name="strength"
            options={strengthOptions}
            value={strength}
            onChange={setStrength}
            columns={1}
          />
        )}
        {step === 3 && (
          <OptionCards
            name="specification"
            options={specificationOptions}
            value={specification}
            onChange={setSpecification}
            columns={1}
          />
        )}
        {step === 4 && (
          <div className="max-w-xl space-y-2.5">
            <Label
              htmlFor="finder-region"
              className="text-label text-concrete-800"
            >
              Project region
            </Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger
                id="finder-region"
                className="h-12 w-full rounded-[12px] border-concrete-300 bg-white px-4 text-[15px] font-semibold text-concrete-950"
              >
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-concrete-200 pt-8">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="h-12 rounded-full px-6 font-bold text-concrete-800"
        >
          <ArrowLeftIcon aria-hidden="true" />
          Back
        </Button>
        {step < TOTAL_STEPS - 1 ? (
          <Button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))}
            className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
          >
            Continue
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!canContinue}
            onClick={() => setShowResult(true)}
            className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
          >
            See My Recommendation
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Result screen ────────────────────────────────────────────── */

function FinderResult({
  product,
  reasons,
  hasSpecification,
  onRestart,
}: {
  product: Product;
  reasons: string[];
  hasSpecification: boolean;
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {hasSpecification && (
        <div className="flex items-start gap-3.5 rounded-[18px] border border-camel-yellow-200 bg-camel-yellow-50 p-5">
          <ClipboardCheckIcon
            className="mt-0.5 size-5 shrink-0 text-camel-yellow-700"
            aria-hidden="true"
          />
          <p className="text-[15px] leading-relaxed text-concrete-800">
            <span className="font-bold text-concrete-950">
              An engineer&apos;s specification exists for this project.
            </span>{" "}
            Follow the product specification for final selection and confirm
            any substitution with the responsible engineer before ordering.
          </p>
        </div>
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-14">
        <div className="mx-auto w-full max-w-sm">
          <ProductCard product={product} priority />
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-eyebrow text-camel-green-700">
              Our Recommendation
            </p>
            <h2 className="text-h2 text-balance text-concrete-950">
              Camel Cement Grade {product.grade}
            </h2>
            <p className="text-lead text-concrete-800">
              {product.friendlyName}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-concrete-950">
              Why it fits
            </h3>
            <ul className="space-y-3">
              {reasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-concrete-800"
                >
                  <CheckCircle2Icon
                    className="mt-0.5 size-5 shrink-0 text-camel-green-700"
                    aria-hidden="true"
                  />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-concrete-950">Key uses</h3>
            <ul className="flex flex-wrap gap-2">
              {product.applications.map((application) => (
                <li
                  key={application}
                  className="rounded-full border border-concrete-200 bg-concrete-50 px-3.5 py-1.5 text-sm font-semibold text-concrete-800"
                >
                  {application}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-concrete-200 pt-7">
            <Button
              asChild
              className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
            >
              <Link href={`/products/${product.slug}`}>
                View Product Details
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              className="h-12 rounded-full bg-camel-yellow-500 px-6 font-bold text-camel-black hover:bg-camel-yellow-600"
            >
              <Link href={`/calculator?product=${product.slug}`}>
                <CalculatorIcon aria-hidden="true" />
                Estimate Materials
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-camel-green-700 px-6 font-bold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
            >
              <Link href={`/request-quote?product=${product.slug}`}>
                Request a Quotation
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-12 rounded-full px-6 font-bold text-concrete-800"
            >
              <Link href="/contact">
                <HeadsetIcon aria-hidden="true" />
                Request Technical Support
              </Link>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onRestart}
            className="rounded-full font-bold text-concrete-600 hover:text-concrete-950"
          >
            <RotateCcwIcon aria-hidden="true" />
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}
