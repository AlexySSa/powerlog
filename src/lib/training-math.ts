export type WeightUnit = "kg" | "lb";
export type Readiness = "green" | "yellow" | "red";

const KG_PER_LB = 0.45359237;

function nonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} debe ser un número finito mayor o igual a cero.`);
  }
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

/**
 * e1RM is an estimate, never a measured max. Epley is adjusted with estimated
 * reps in reserve (RIR = 10 - RPE): weight * (1 + (reps + RIR) / 30).
 * A maximal single (1 rep at RPE 10) returns the lifted weight. Missing RPE
 * assumes no reserve. Low-RPE/high-rep estimates are less reliable; this simple
 * model deliberately lives here so it can be replaced without changing storage.
 * Input and result use the same weight unit. Rounded once to one decimal.
 */
export function estimateOneRepMax(weight: number, reps: number, rpe?: number | null) {
  nonNegative(weight, "Peso");
  if (!Number.isInteger(reps) || reps < 1) {
    throw new RangeError("Las repeticiones deben ser un entero positivo.");
  }
  if (rpe != null && (!Number.isFinite(rpe) || rpe < 1 || rpe > 10)) {
    throw new RangeError("RPE debe estar entre 1 y 10.");
  }
  const effectiveReps = reps + (rpe == null ? 0 : 10 - rpe);
  return round(effectiveReps === 1 ? weight : weight * (1 + effectiveReps / 30));
}

/** Exact unit conversion; callers round only for display or plate loading. */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit) {
  nonNegative(value, "Peso");
  if (!["kg", "lb"].includes(from) || !["kg", "lb"].includes(to)) {
    throw new RangeError("Unidad de peso desconocida.");
  }
  return from === to ? value : from === "lb" ? value * KG_PER_LB : value / KG_PER_LB;
}

/** Percent is expressed as 75 for 75%, including percentages above 100. */
export function percentageOf(value: number, percent: number) {
  nonNegative(value, "Valor");
  nonNegative(percent, "Porcentaje");
  return value * percent / 100;
}

/** A missing/zero baseline has no meaningful percentage change. */
export function percentageChange(current: number, previous: number) {
  nonNegative(current, "Valor actual");
  nonNegative(previous, "Valor anterior");
  return previous === 0 ? null : (current - previous) / previous * 100;
}

export interface ProgressionInput {
  currentWeight: number;
  actualRpe: number;
  targetRpe: number;
  /** Fraction from 0 (none) to 1 (complete). */
  completionRate: number;
  readiness: Readiness;
  e1rmChangePercent?: number | null;
  /** Plate increment in the same unit as currentWeight. Defaults to 2.5. */
  increment?: number;
}

/** Advisory only: the caller must request approval before changing a program. */
export function recommendProgression(input: ProgressionInput) {
  const { currentWeight, actualRpe, targetRpe, completionRate, readiness, e1rmChangePercent, increment = 2.5 } = input;
  nonNegative(currentWeight, "Peso");
  if (!Number.isFinite(increment) || increment <= 0 ||
      !Number.isFinite(actualRpe) || actualRpe < 1 || actualRpe > 10 ||
      !Number.isFinite(targetRpe) || targetRpe < 1 || targetRpe > 10 ||
      !Number.isFinite(completionRate) || completionRate < 0 || completionRate > 1 ||
      !["green", "yellow", "red"].includes(readiness) ||
      (e1rmChangePercent != null && !Number.isFinite(e1rmChangePercent))) {
    throw new RangeError("Datos de progresión inválidos.");
  }

  let action: "maintain" | "increase" | "reduce" = "maintain";
  let suggestedWeight = currentWeight;
  let reason = "Mantén la carga y consolida la técnica antes de progresar.";

  if (readiness === "red" || completionRate < 0.8 || actualRpe > targetRpe + 1 || (e1rmChangePercent != null && e1rmChangePercent <= -5)) {
    action = "reduce";
    // Never increase an off-grid load while rounding a suggested reduction.
    suggestedWeight = Math.floor(currentWeight * 0.95 / increment) * increment;
    reason = "Considera reducir la carga: la recuperación o el rendimiento requieren atención.";
  } else if (readiness === "green" && completionRate === 1 && actualRpe <= targetRpe && e1rmChangePercent != null && e1rmChangePercent >= 0 && currentWeight > 0) {
    // One increment only, capped at 2.5%; stay put if the next plate is too large.
    const nextWeight = (Math.floor(currentWeight / increment) + 1) * increment;
    if (nextWeight - currentWeight <= currentWeight * 0.025 + Number.EPSILON) {
      action = "increase";
      suggestedWeight = nextWeight;
      reason = "Puedes proponer un incremento pequeño tras completar el trabajo con RPE controlado.";
    }
  }

  return { action, suggestedWeight, reason, requiresConfirmation: true as const };
}
