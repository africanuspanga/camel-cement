"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CalculatorIcon,
  MailIcon,
  MessageCircleIcon,
  PrinterIcon,
} from "lucide-react";
import { getProduct } from "@/lib/products";
import type {
  CalculationResult,
  CalculatorConfig,
  ProductRecommendation,
} from "@/lib/calculators";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number): string {
  return numberFormat.format(value);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-white/12 py-3">
      <dt className="text-sm text-white/70">{label}</dt>
      <dd className="text-base font-bold tabular-nums">{value}</dd>
    </div>
  );
}

const secondaryAction =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 text-sm font-bold text-white transition-colors hover:bg-white/10";

export function ResultCard({
  config,
  result,
  recommendation,
  summary,
}: {
  config: CalculatorConfig;
  result: CalculationResult | null;
  recommendation: ProductRecommendation;
  summary: string;
}) {
  const product = getProduct(recommendation.slug);
  const isMasonry = result?.areaM2 !== undefined;
  const areaLabel =
    config.type === "block-laying" || config.type === "brick-laying"
      ? "Wall area"
      : "Area";

  if (!result) {
    return (
      <div className="rounded-[24px] bg-camel-green-900 p-7 text-white shadow-raised">
        <p className="text-eyebrow text-camel-yellow-500">
          Estimated requirement
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/10">
            <CalculatorIcon aria-hidden="true" className="size-7 text-camel-yellow-500" />
          </span>
          <p className="text-lg font-bold">
            Enter your measurements to see the estimate.
          </p>
          <p className="max-w-xs text-sm text-white/70">
            The estimate updates instantly as you type. Choose a mix ratio and
            wastage allowance to refine the result.
          </p>
        </div>
      </div>
    );
  }

  const encodedSummary = encodeURIComponent(summary);
  const emailSubject = encodeURIComponent(
    `Camel Cement estimate: ${config.label}`
  );
  const quoteHref = `/request-quote?product=${recommendation.slug}&bags=${result.cementBags}&source=calculator`;

  return (
    <div className="rounded-[24px] bg-camel-green-900 p-7 text-white shadow-raised">
      <p className="text-eyebrow text-camel-yellow-500">
        Estimated requirement
      </p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[clamp(3.25rem,6vw,4.25rem)] font-bold leading-none tracking-tight text-camel-yellow-500 tabular-nums">
          {formatNumber(result.cementBags)}
        </span>
        <span className="text-2xl font-bold text-camel-yellow-500">
          {result.cementBags === 1 ? "bag" : "bags"}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/70">
        50 kg bags of cement, rounded up
      </p>

      <dl className="mt-6">
        <DetailRow
          label="Cement"
          value={`${formatNumber(result.cementKg)} kg`}
        />
        <DetailRow label="Sand" value={`${formatNumber(result.sandM3)} m³`} />
        {result.aggregateM3 !== undefined ? (
          <DetailRow
            label="Aggregate"
            value={`${formatNumber(result.aggregateM3)} m³`}
          />
        ) : null}
        {isMasonry && result.areaM2 !== undefined ? (
          <DetailRow
            label={areaLabel}
            value={`${formatNumber(result.areaM2)} m²`}
          />
        ) : null}
        {result.wetVolumeM3 !== undefined ? (
          <DetailRow
            label={isMasonry ? "Mortar volume (wet)" : "Concrete volume (wet)"}
            value={`${formatNumber(result.wetVolumeM3)} m³`}
          />
        ) : null}
        <DetailRow
          label="Wastage allowance"
          value={`${result.wastagePercent}%`}
        />
      </dl>

      {product ? (
        <div className="mt-5 rounded-2xl bg-white/8 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-camel-yellow-500">
            Recommended product
          </p>
          <p className="mt-1.5 text-lg font-bold">
            Camel Cement {product.grade}
            <span className="font-normal text-white/70">
              {" "}
              ({product.friendlyName})
            </span>
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/70">
            {recommendation.reason}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-bold text-camel-yellow-500 hover:text-camel-yellow-200"
          >
            View product
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/60">
          Assumptions
        </p>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-white/60">
          {result.assumptions.map((assumption) => (
            <li key={assumption} className="flex gap-2">
              <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-white/40" />
              {assumption}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-col gap-2.5 print:hidden">
        <Link
          href={quoteHref}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-camel-yellow-500 px-5 text-sm font-bold text-camel-black transition-colors hover:bg-camel-yellow-600"
        >
          Request Quote from This Estimate
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className={secondaryAction}
        >
          <PrinterIcon aria-hidden="true" className="size-4" />
          Save as PDF
        </button>
        <a
          href={`https://wa.me/?text=${encodedSummary}`}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryAction}
        >
          <MessageCircleIcon aria-hidden="true" className="size-4" />
          Send to WhatsApp
        </a>
        <a
          href={`mailto:?subject=${emailSubject}&body=${encodedSummary}`}
          className={secondaryAction}
        >
          <MailIcon aria-hidden="true" className="size-4" />
          Email Estimate
        </a>
      </div>
    </div>
  );
}
