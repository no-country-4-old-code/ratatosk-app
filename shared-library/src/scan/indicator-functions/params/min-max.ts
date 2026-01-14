export type MinMax = { min: number; max: number };

export function isValueInRange(value: number, minMax: MinMax): boolean {
    return value >= minMax.min && value <= minMax.max;
}