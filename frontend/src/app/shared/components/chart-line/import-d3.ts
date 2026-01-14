export interface ImportD3 {
    d3: any;
    d3Scale: any;
    d3Shape: any;
    d3Array: any;
    d3Axis: any;
}

export async function importD3(): Promise<ImportD3> {
    const d3 = await import('d3');
    return {
        d3,
        d3Scale: await import('d3-scale'),
        d3Shape: await import('d3-shape'),
        d3Array: await import('d3-array'),
        d3Axis: await import('d3-axis'),
    }
}