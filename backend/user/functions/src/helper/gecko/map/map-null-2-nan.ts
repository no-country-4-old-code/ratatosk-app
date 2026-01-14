export function mapNull2Nan(value: number | null): number {
    if (value === null) {
        return NaN;
    } else {
        return value;
    }
}