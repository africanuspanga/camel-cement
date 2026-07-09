"use client";

import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalculatorField, CalculatorSelect } from "@/lib/calculators";

const inputBase =
  "h-13 w-full rounded-xl border border-concrete-200 bg-white px-3.5 text-base text-concrete-950 shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-concrete-400 focus:border-camel-green-700 focus:shadow-[0_0_0_4px_rgba(0,135,44,0.12)]";

export function NumberField({
  field,
  value,
  onChange,
}: {
  field: CalculatorField;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = `calc-${field.key}`;
  const helpId = field.help ? `${inputId}-help` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-[650] text-concrete-950"
      >
        {field.label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          aria-describedby={helpId}
          className={cn(inputBase, "pr-14 tabular-nums")}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-xl border-l border-concrete-200 bg-concrete-50 px-3 text-sm font-[650] text-concrete-600"
        >
          {field.unit}
        </span>
      </div>
      {field.help ? (
        <p id={helpId} className="text-sm leading-snug text-concrete-600">
          {field.help}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField({
  select,
  value,
  onChange,
}: {
  select: CalculatorSelect;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectId = `calc-${select.key}`;
  const helpId = select.help ? `${selectId}-help` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={selectId}
        className="block text-sm font-[650] text-concrete-950"
      >
        {select.label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={helpId}
          className={cn(inputBase, "appearance-none pr-11")}
        >
          {select.choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-concrete-600"
        />
      </div>
      {select.help ? (
        <p id={helpId} className="text-sm leading-snug text-concrete-600">
          {select.help}
        </p>
      ) : null}
    </div>
  );
}
