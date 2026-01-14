
export function sum(numbers: number[]): number {
    return numbers.reduce((pv, cv) => pv + cv, 0);
}

export function average(numbers: number[]): number {
    let calcedMean = NaN;
    if (numbers.length > 0) {
        calcedMean = mean(numbers);
    }
    return calcedMean;
}

export function std(numbers: number[]): number {
    let result = NaN;
    if (numbers.length > 0) {
        const calcedMean = mean(numbers);
        result = Math.sqrt(numbers.map(x => Math.pow(x - calcedMean, 2)).reduce((a, b) => a + b) / numbers.length);
    }
    return result;
}

// private

function mean(numbers: number[]): number {
    return sum(numbers) / numbers.length;
}