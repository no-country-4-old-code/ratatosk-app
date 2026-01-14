export function calcDelta(newValue: number, oldValues: number[]): number {
    let delta = NaN;
    let lastValue: number;
    if (oldValues.length > 0) {
        lastValue = oldValues[oldValues.length - 1];
        if (lastValue === 0) {
            delta = newValue >= 0 ? Infinity : -Infinity;
        } else {
            delta = (newValue - lastValue) / lastValue;
        }
    }
    return delta;
}
