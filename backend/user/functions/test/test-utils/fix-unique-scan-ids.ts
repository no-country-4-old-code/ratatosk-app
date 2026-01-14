import {Scan} from '../../../../../shared-library/src/scan/interfaces';

export function fixUniqueScanIds(scans: Scan[]) {
    // sometimes scan dummy creation ends up with multipe scans havng the same id which leads to bad behaviour during compression
    scans.forEach((scan, idx) => {
        scan.id = idx;
    });
}