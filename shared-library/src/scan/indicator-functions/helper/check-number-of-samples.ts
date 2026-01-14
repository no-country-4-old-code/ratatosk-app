export function checkNumberOfAvailableSamples(numberOfSamplesNeeded: number, samples: number[], name: string): void {
    if (numberOfSamplesNeeded > samples.length) {
        throw Error(`Indicator function "${name}" failed: Insufficient data length. Have ${samples.length} < ${numberOfSamplesNeeded} (needed)`);
    }
}
