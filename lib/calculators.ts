import { z } from "zod";

/**
 * Camel Cement material estimation engine.
 *
 * Pure, unit-testable functions using industry-standard preliminary
 * estimation methods. All outputs are planning estimates only and must be
 * confirmed by a qualified professional before construction.
 */

// ── Types ────────────────────────────────────────────────────────────

export const calculatorTypes = [
  "concrete-slab",
  "foundation",
  "column",
  "beam",
  "general-concrete",
  "block-laying",
  "brick-laying",
  "wall-plastering",
  "floor-screed",
  "paving",
] as const;

export type CalculatorType = (typeof calculatorTypes)[number];

export const calculatorTypeSchema = z.enum(calculatorTypes);

export interface CalculatorField {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  help?: string;
  /** Sensible technical default pre-filled in the form (e.g. thickness). */
  defaultValue?: number;
}

export interface SelectChoice {
  value: string;
  label: string;
}

export interface CalculatorSelect {
  key: string;
  label: string;
  choices: SelectChoice[];
  defaultValue: string;
  help?: string;
}

/** Numeric inputs keyed by field key. */
export type CalculatorInputs = Record<string, number>;

/** Select options keyed by select key (includes "wastage"). */
export type CalculatorOptions = Record<string, string>;

export interface CalculationResult {
  /** 50 kg bags, wastage included, always rounded up. */
  cementBags: number;
  cementKg: number;
  sandM3: number;
  aggregateM3?: number;
  /** Wet concrete volume, or wet mortar volume for masonry work. */
  wetVolumeM3?: number;
  /** Wall or surface area for masonry, plaster, screed and paving. */
  areaM2?: number;
  wastagePercent: number;
  assumptions: string[];
}

export interface ProductRecommendation {
  slug: string;
  reason: string;
}

export interface CalculatorConfig {
  type: CalculatorType;
  label: string;
  description: string;
  fields: CalculatorField[];
  selects: CalculatorSelect[];
  calculate: (
    inputs: CalculatorInputs,
    options: CalculatorOptions
  ) => CalculationResult;
}

// ── Engineering constants ────────────────────────────────────────────

/** Dry volume factor for concrete (wet volume to dry loose materials). */
export const DRY_FACTOR_CONCRETE = 1.54;

/** Dry volume factor for mortar. */
export const DRY_FACTOR_MORTAR = 1.33;

/** Bulk density of cement in kg per cubic metre. */
export const CEMENT_DENSITY_KG_M3 = 1440;

/** Standard Camel Cement bag weight in kg. */
export const BAG_WEIGHT_KG = 50;

/** 390 x 190 mm block face with 10 mm mortar joints. */
export const BLOCKS_PER_M2 = 12.5;

/** 230 x 76 mm brick face, half-brick wall, 10 mm joints. */
export const BRICKS_PER_M2 = 60;

/** Wet mortar allowance per square metre of block wall. */
export const BLOCK_MORTAR_M3_PER_M2 = 0.02;

/** Wet mortar allowance per square metre of brick wall. */
export const BRICK_MORTAR_M3_PER_M2 = 0.03;

// ── Shared option definitions ────────────────────────────────────────

export const WASTAGE_SELECT: CalculatorSelect = {
  key: "wastage",
  label: "Wastage allowance",
  choices: [
    { value: "0", label: "0% (no allowance)" },
    { value: "5", label: "5% (recommended)" },
    { value: "10", label: "10%" },
    { value: "15", label: "15%" },
  ],
  defaultValue: "5",
  help: "Covers spillage, over-excavation and site losses.",
};

export const CONCRETE_MIX_SELECT: CalculatorSelect = {
  key: "mix",
  label: "Concrete mix ratio",
  choices: [
    { value: "1:2:4", label: "1:2:4 (approx. C20, general structural)" },
    { value: "1:1.5:3", label: "1:1.5:3 (approx. C25, higher strength)" },
    { value: "1:3:6", label: "1:3:6 (approx. C15, lean concrete)" },
  ],
  defaultValue: "1:2:4",
  help: "Cement : sand : aggregate by volume.",
};

export const MORTAR_MIX_SELECT: CalculatorSelect = {
  key: "mortarMix",
  label: "Mortar mix ratio",
  choices: [
    { value: "1:3", label: "1:3 (rich mix)" },
    { value: "1:4", label: "1:4 (standard)" },
    { value: "1:5", label: "1:5 (economical)" },
    { value: "1:6", label: "1:6 (lean mix)" },
  ],
  defaultValue: "1:4",
  help: "Cement : sand by volume.",
};

const CONCRETE_GRADE_LABEL: Record<string, string> = {
  "1:2:4": "approx. C20",
  "1:1.5:3": "approx. C25",
  "1:3:6": "approx. C15",
};

// ── Core math (pure, exported for testing) ───────────────────────────

export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Parses a volume ratio string such as "1:2:4" into numeric parts. */
export function parseMixRatio(mix: string): number[] {
  return mix.split(":").map((part) => Number(part));
}

export function wastageFactor(wastagePercent: number): number {
  return 1 + wastagePercent / 100;
}

function readWastage(options: CalculatorOptions): number {
  const parsed = Number(options.wastage);
  return Number.isFinite(parsed) ? parsed : 5;
}

/**
 * Materials for a wet concrete volume using the dry volume method:
 * dry volume = wet x 1.54, cement share = 1 / sum of mix parts,
 * cement mass at 1440 kg per cubic metre, 50 kg bags rounded up.
 */
export function concreteMaterials(
  wetVolumeM3: number,
  mix: string,
  wastagePercent: number
): CalculationResult {
  const parts = parseMixRatio(mix);
  const [cementPart, sandPart, aggregatePart] = parts;
  const sum = parts.reduce((total, part) => total + part, 0);
  const dryVolume = wetVolumeM3 * DRY_FACTOR_CONCRETE;
  const waste = wastageFactor(wastagePercent);

  const cementKg =
    dryVolume * (cementPart / sum) * CEMENT_DENSITY_KG_M3 * waste;
  const gradeLabel = CONCRETE_GRADE_LABEL[mix];

  return {
    cementBags: Math.ceil(cementKg / BAG_WEIGHT_KG),
    cementKg: Math.round(cementKg),
    sandM3: roundTo(dryVolume * (sandPart / sum) * waste),
    aggregateM3: roundTo(dryVolume * (aggregatePart / sum) * waste),
    wetVolumeM3: roundTo(wetVolumeM3),
    wastagePercent,
    assumptions: [
      `Mix ratio ${mix}${gradeLabel ? ` (${gradeLabel})` : ""}, cement : sand : aggregate by volume`,
      `Dry volume factor ${DRY_FACTOR_CONCRETE} applied to the wet concrete volume`,
      `Cement bulk density ${CEMENT_DENSITY_KG_M3} kg per cubic metre, ${BAG_WEIGHT_KG} kg bags rounded up`,
      `Wastage allowance of ${wastagePercent}% included`,
    ],
  };
}

/**
 * Materials for a wet mortar volume: dry volume = wet x 1.33,
 * cement share = 1 / sum of mix parts, remainder is sand.
 */
export function mortarMaterials(
  wetMortarM3: number,
  mortarMix: string,
  wastagePercent: number,
  extraAssumptions: string[] = [],
  areaM2?: number
): CalculationResult {
  const parts = parseMixRatio(mortarMix);
  const [cementPart, sandPart] = parts;
  const sum = parts.reduce((total, part) => total + part, 0);
  const dryVolume = wetMortarM3 * DRY_FACTOR_MORTAR;
  const waste = wastageFactor(wastagePercent);

  const cementKg =
    dryVolume * (cementPart / sum) * CEMENT_DENSITY_KG_M3 * waste;

  return {
    cementBags: Math.ceil(cementKg / BAG_WEIGHT_KG),
    cementKg: Math.round(cementKg),
    sandM3: roundTo(dryVolume * (sandPart / sum) * waste),
    wetVolumeM3: roundTo(wetMortarM3, 3),
    areaM2: areaM2 === undefined ? undefined : roundTo(areaM2, 1),
    wastagePercent,
    assumptions: [
      ...extraAssumptions,
      `Mortar mix ratio ${mortarMix}, cement : sand by volume`,
      `Dry volume factor ${DRY_FACTOR_MORTAR} applied to the wet mortar volume`,
      `Cement bulk density ${CEMENT_DENSITY_KG_M3} kg per cubic metre, ${BAG_WEIGHT_KG} kg bags rounded up`,
      `Wastage allowance of ${wastagePercent}% included`,
    ],
  };
}

// ── Calculator configurations ────────────────────────────────────────

export const calculatorConfigs: Record<CalculatorType, CalculatorConfig> = {
  "concrete-slab": {
    type: "concrete-slab",
    label: "Concrete slab",
    description: "Floor slabs, roof slabs and ground slabs.",
    fields: [
      {
        key: "length",
        label: "Slab length",
        unit: "m",
        min: 0.1,
        max: 200,
        step: 0.1,
      },
      {
        key: "width",
        label: "Slab width",
        unit: "m",
        min: 0.1,
        max: 200,
        step: 0.1,
      },
      {
        key: "thickness",
        label: "Slab thickness",
        unit: "mm",
        min: 50,
        max: 500,
        step: 5,
        defaultValue: 150,
        help: "Typical floor slabs are 100 to 150 mm thick.",
      },
    ],
    selects: [CONCRETE_MIX_SELECT, WASTAGE_SELECT],
    calculate: (inputs, options) =>
      concreteMaterials(
        inputs.length * inputs.width * (inputs.thickness / 1000),
        options.mix ?? CONCRETE_MIX_SELECT.defaultValue,
        readWastage(options)
      ),
  },

  foundation: {
    type: "foundation",
    label: "Foundation",
    description: "Strip footings and foundation trenches.",
    fields: [
      {
        key: "trenchLength",
        label: "Total trench length",
        unit: "m",
        min: 0.1,
        max: 1000,
        step: 0.1,
        help: "Combined length of all strip footings.",
      },
      {
        key: "width",
        label: "Trench width",
        unit: "m",
        min: 0.1,
        max: 3,
        step: 0.05,
      },
      {
        key: "depth",
        label: "Concrete depth",
        unit: "m",
        min: 0.1,
        max: 3,
        step: 0.05,
        help: "Depth of the concrete fill, not the full excavation.",
      },
    ],
    selects: [CONCRETE_MIX_SELECT, WASTAGE_SELECT],
    calculate: (inputs, options) =>
      concreteMaterials(
        inputs.trenchLength * inputs.width * inputs.depth,
        options.mix ?? CONCRETE_MIX_SELECT.defaultValue,
        readWastage(options)
      ),
  },

  column: {
    type: "column",
    label: "Column",
    description: "Structural columns and pillars.",
    fields: [
      {
        key: "count",
        label: "Number of columns",
        unit: "no.",
        min: 1,
        max: 500,
        step: 1,
      },
      {
        key: "width",
        label: "Column width",
        unit: "mm",
        min: 100,
        max: 1500,
        step: 10,
        defaultValue: 230,
      },
      {
        key: "depth",
        label: "Column depth",
        unit: "mm",
        min: 100,
        max: 1500,
        step: 10,
        defaultValue: 230,
      },
      {
        key: "height",
        label: "Column height",
        unit: "m",
        min: 0.1,
        max: 20,
        step: 0.1,
      },
    ],
    selects: [CONCRETE_MIX_SELECT, WASTAGE_SELECT],
    calculate: (inputs, options) =>
      concreteMaterials(
        inputs.count *
          (inputs.width / 1000) *
          (inputs.depth / 1000) *
          inputs.height,
        options.mix ?? CONCRETE_MIX_SELECT.defaultValue,
        readWastage(options)
      ),
  },

  beam: {
    type: "beam",
    label: "Beam",
    description: "Ring beams, lintels and structural beams.",
    fields: [
      {
        key: "count",
        label: "Number of beams",
        unit: "no.",
        min: 1,
        max: 500,
        step: 1,
      },
      {
        key: "width",
        label: "Beam width",
        unit: "mm",
        min: 100,
        max: 1500,
        step: 10,
        defaultValue: 230,
      },
      {
        key: "depth",
        label: "Beam depth",
        unit: "mm",
        min: 100,
        max: 2000,
        step: 10,
        defaultValue: 450,
      },
      {
        key: "length",
        label: "Beam length",
        unit: "m",
        min: 0.1,
        max: 100,
        step: 0.1,
      },
    ],
    selects: [CONCRETE_MIX_SELECT, WASTAGE_SELECT],
    calculate: (inputs, options) =>
      concreteMaterials(
        inputs.count *
          (inputs.width / 1000) *
          (inputs.depth / 1000) *
          inputs.length,
        options.mix ?? CONCRETE_MIX_SELECT.defaultValue,
        readWastage(options)
      ),
  },

  "general-concrete": {
    type: "general-concrete",
    label: "General concrete volume",
    description: "Enter a concrete volume directly.",
    fields: [
      {
        key: "volume",
        label: "Wet concrete volume",
        unit: "m³",
        min: 0.01,
        max: 10000,
        step: 0.1,
        help: "Total volume of finished concrete required.",
      },
    ],
    selects: [CONCRETE_MIX_SELECT, WASTAGE_SELECT],
    calculate: (inputs, options) =>
      concreteMaterials(
        inputs.volume,
        options.mix ?? CONCRETE_MIX_SELECT.defaultValue,
        readWastage(options)
      ),
  },

  "block-laying": {
    type: "block-laying",
    label: "Block laying",
    description: "Concrete block walls and mortar.",
    fields: [
      {
        key: "wallLength",
        label: "Wall length",
        unit: "m",
        min: 0.1,
        max: 500,
        step: 0.1,
        help: "Combined length of all walls.",
      },
      {
        key: "wallHeight",
        label: "Wall height",
        unit: "m",
        min: 0.1,
        max: 20,
        step: 0.1,
      },
    ],
    selects: [
      MORTAR_MIX_SELECT,
      {
        key: "highEarly",
        label: "High early strength",
        choices: [
          { value: "no", label: "Not required" },
          { value: "yes", label: "Required (block production)" },
        ],
        defaultValue: "no",
        help: "Choose Required when producing blocks that must be handled early.",
      },
      WASTAGE_SELECT,
    ],
    calculate: (inputs, options) => {
      const area = inputs.wallLength * inputs.wallHeight;
      const blocks = Math.ceil(area * BLOCKS_PER_M2);
      return mortarMaterials(
        area * BLOCK_MORTAR_M3_PER_M2,
        options.mortarMix ?? MORTAR_MIX_SELECT.defaultValue,
        readWastage(options),
        [
          `${BLOCKS_PER_M2} blocks per square metre based on a 390 x 190 mm block face with 10 mm joints`,
          `Approximately ${blocks} blocks required (blocks are not included in the cement estimate)`,
          `Mortar allowance of ${BLOCK_MORTAR_M3_PER_M2} cubic metres per square metre of wall`,
        ],
        area
      );
    },
  },

  "brick-laying": {
    type: "brick-laying",
    label: "Brick laying",
    description: "Brick walls and jointing mortar.",
    fields: [
      {
        key: "wallLength",
        label: "Wall length",
        unit: "m",
        min: 0.1,
        max: 500,
        step: 0.1,
        help: "Combined length of all walls.",
      },
      {
        key: "wallHeight",
        label: "Wall height",
        unit: "m",
        min: 0.1,
        max: 20,
        step: 0.1,
      },
    ],
    selects: [MORTAR_MIX_SELECT, WASTAGE_SELECT],
    calculate: (inputs, options) => {
      const area = inputs.wallLength * inputs.wallHeight;
      const bricks = Math.ceil(area * BRICKS_PER_M2);
      return mortarMaterials(
        area * BRICK_MORTAR_M3_PER_M2,
        options.mortarMix ?? MORTAR_MIX_SELECT.defaultValue,
        readWastage(options),
        [
          `${BRICKS_PER_M2} bricks per square metre for a half-brick wall (230 x 110 x 76 mm bricks, 10 mm joints)`,
          `Approximately ${bricks} bricks required (bricks are not included in the cement estimate)`,
          `Mortar allowance of ${BRICK_MORTAR_M3_PER_M2} cubic metres per square metre of wall`,
        ],
        area
      );
    },
  },

  "wall-plastering": {
    type: "wall-plastering",
    label: "Wall plastering",
    description: "Internal and external wall plaster.",
    fields: [
      {
        key: "area",
        label: "Plastered area",
        unit: "m²",
        min: 0.1,
        max: 10000,
        step: 0.5,
        help: "Total wall face area to be plastered.",
      },
    ],
    selects: [
      {
        key: "thickness",
        label: "Plaster thickness",
        choices: [
          { value: "10", label: "10 mm" },
          { value: "12", label: "12 mm (standard)" },
          { value: "15", label: "15 mm" },
          { value: "20", label: "20 mm" },
        ],
        defaultValue: "12",
      },
      MORTAR_MIX_SELECT,
      WASTAGE_SELECT,
    ],
    calculate: (inputs, options) => {
      const thicknessMm = Number(options.thickness ?? "12");
      return mortarMaterials(
        inputs.area * (thicknessMm / 1000),
        options.mortarMix ?? MORTAR_MIX_SELECT.defaultValue,
        readWastage(options),
        [`Plaster thickness of ${thicknessMm} mm applied over the full area`],
        inputs.area
      );
    },
  },

  "floor-screed": {
    type: "floor-screed",
    label: "Floor screed",
    description: "Levelling screed over floor slabs.",
    fields: [
      {
        key: "area",
        label: "Floor area",
        unit: "m²",
        min: 0.1,
        max: 10000,
        step: 0.5,
      },
      {
        key: "thickness",
        label: "Screed thickness",
        unit: "mm",
        min: 20,
        max: 100,
        step: 5,
        defaultValue: 40,
        help: "Typical bonded screeds are 30 to 50 mm thick.",
      },
    ],
    selects: [WASTAGE_SELECT],
    calculate: (inputs, options) =>
      mortarMaterials(
        inputs.area * (inputs.thickness / 1000),
        "1:4",
        readWastage(options),
        [`Screed thickness of ${inputs.thickness} mm applied over the full area`],
        inputs.area
      ),
  },

  paving: {
    type: "paving",
    label: "Paving",
    description: "Mortar bedding for paver installation.",
    fields: [
      {
        key: "area",
        label: "Paved area",
        unit: "m²",
        min: 0.1,
        max: 10000,
        step: 0.5,
      },
      {
        key: "thickness",
        label: "Bedding thickness",
        unit: "mm",
        min: 25,
        max: 100,
        step: 5,
        defaultValue: 50,
        help: "Mortar bed laid beneath the pavers.",
      },
    ],
    selects: [WASTAGE_SELECT],
    calculate: (inputs, options) =>
      mortarMaterials(
        inputs.area * (inputs.thickness / 1000),
        "1:6",
        readWastage(options),
        [
          `Bedding thickness of ${inputs.thickness} mm beneath the pavers`,
          "Pavers themselves are not included in this estimate",
        ],
        inputs.area
      ),
  },
};

/** Configs in the display order defined by the content document. */
export const calculatorList: CalculatorConfig[] = calculatorTypes.map(
  (type) => calculatorConfigs[type]
);

export function getCalculatorConfig(type: CalculatorType): CalculatorConfig {
  return calculatorConfigs[type];
}

/** Default numeric inputs for a type (only fields with defaults). */
export function defaultInputsFor(type: CalculatorType): CalculatorInputs {
  const defaults: CalculatorInputs = {};
  for (const field of calculatorConfigs[type].fields) {
    if (field.defaultValue !== undefined) {
      defaults[field.key] = field.defaultValue;
    }
  }
  return defaults;
}

/** Default option values (mix ratios, wastage) for a type. */
export function defaultOptionsFor(type: CalculatorType): CalculatorOptions {
  const defaults: CalculatorOptions = {};
  for (const select of calculatorConfigs[type].selects) {
    defaults[select.key] = select.defaultValue;
  }
  return defaults;
}

// ── Product recommendation ───────────────────────────────────────────

const CONCRETE_TYPES: ReadonlySet<CalculatorType> = new Set([
  "concrete-slab",
  "foundation",
  "column",
  "beam",
  "general-concrete",
]);

export function recommendedProduct(
  type: CalculatorType,
  options: CalculatorOptions = {}
): ProductRecommendation {
  if (CONCRETE_TYPES.has(type)) {
    if (options.mix === "1:3:6") {
      return {
        slug: "32-5r",
        reason:
          "Grade 32.5R gives consistent, economical performance for lean 1:3:6 site concrete.",
      };
    }
    if (options.mix === "1:1.5:3") {
      return {
        slug: "42-5n",
        reason:
          "Grade 42.5N delivers the dependable structural strength required for a higher-strength 1:1.5:3 mix.",
      };
    }
    return {
      slug: "42-5n",
      reason:
        "Grade 42.5N provides strong long-term strength development for structural concrete work.",
    };
  }

  switch (type) {
    case "block-laying":
      if (options.highEarly === "yes") {
        return {
          slug: "42-5r",
          reason:
            "Grade 42.5R provides the high early strength that supports efficient block production and early handling.",
        };
      }
      return {
        slug: "32-5r",
        reason:
          "Grade 32.5R offers practical workability and economical performance for general blockwork mortar.",
      };
    case "brick-laying":
      return {
        slug: "32-5r",
        reason:
          "Grade 32.5R is a dependable all-purpose choice for brickwork and jointing mortar.",
      };
    case "wall-plastering":
      return {
        slug: "32-5r",
        reason:
          "Grade 32.5R offers the consistent workability that plastering mortar requires.",
      };
    case "floor-screed":
      return {
        slug: "32-5r",
        reason:
          "Grade 32.5R provides reliable, economical performance for floor screed work.",
      };
    default:
      return {
        slug: "32-5n",
        reason:
          "Grade 32.5N offers high workability and controlled heat development for paving and bedding work.",
      };
  }
}

// ── Zod schemas for server validation ────────────────────────────────

function inputSchemaFromFields(fields: CalculatorField[]) {
  const shape: Record<string, z.ZodNumber> = {};
  for (const field of fields) {
    shape[field.key] = z.number().min(field.min).max(field.max);
  }
  return z.object(shape);
}

function optionsSchemaFromSelects(selects: CalculatorSelect[]) {
  const shape: Record<string, z.ZodType<string>> = {};
  for (const select of selects) {
    const values = select.choices.map((choice) => choice.value) as [
      string,
      ...string[],
    ];
    shape[select.key] = z.enum(values).catch(select.defaultValue);
  }
  return z.object(shape);
}

/** Per-type numeric input schemas built from the field definitions. */
export const calculatorInputSchemas = Object.fromEntries(
  calculatorTypes.map((type) => [
    type,
    inputSchemaFromFields(calculatorConfigs[type].fields),
  ])
) as Record<CalculatorType, ReturnType<typeof inputSchemaFromFields>>;

/** Per-type option schemas built from the select definitions. */
export const calculatorOptionsSchemas = Object.fromEntries(
  calculatorTypes.map((type) => [
    type,
    optionsSchemaFromSelects(calculatorConfigs[type].selects),
  ])
) as Record<CalculatorType, ReturnType<typeof optionsSchemaFromSelects>>;

export const calculationResultSchema = z.object({
  cementBags: z.number().int().nonnegative(),
  cementKg: z.number().nonnegative(),
  sandM3: z.number().nonnegative(),
  aggregateM3: z.number().nonnegative().optional(),
  wetVolumeM3: z.number().nonnegative().optional(),
  areaM2: z.number().nonnegative().optional(),
  wastagePercent: z.number().min(0).max(100),
  assumptions: z.array(z.string().max(300)).max(12),
});

/** Payload accepted by POST /api/calculator (analytics persistence). */
export const calculatorSessionSchema = z.object({
  calculatorType: calculatorTypeSchema,
  inputs: z.record(z.string(), z.number().finite()),
  options: z.record(z.string(), z.string().max(40)).optional(),
  results: calculationResultSchema,
  recommendedProduct: z.string().max(40).nullish(),
});

export type CalculatorSessionPayload = z.infer<typeof calculatorSessionSchema>;

/**
 * Validates raw inputs and options for a type and runs the calculation.
 * Returns null when validation fails. Safe for server-side use.
 */
export function safeCalculate(
  type: CalculatorType,
  inputs: unknown,
  options: unknown
): CalculationResult | null {
  const parsedInputs = calculatorInputSchemas[type].safeParse(inputs);
  const parsedOptions = calculatorOptionsSchemas[type].safeParse(options);
  if (!parsedInputs.success || !parsedOptions.success) return null;
  return calculatorConfigs[type].calculate(
    parsedInputs.data,
    parsedOptions.data
  );
}

// ── Verbatim content (from the master build document) ────────────────

export const CALCULATOR_DISCLAIMER =
  "This calculator provides preliminary planning estimates only. Actual requirements vary according to the approved mix design, material properties, workmanship, compaction, curing, site conditions and wastage. Structural calculations and final material quantities should be confirmed by a qualified professional.";
