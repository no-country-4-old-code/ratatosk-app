import {Scan} from '../../../../../shared-library/src/scan/interfaces';
import {Coin} from '@lib/coin/interfaces';

export interface ScanFrontend extends Scan {
    readonly iconPath: string;
    readonly numberOfNewAndUnseenAssets: number;
}

export type RelationToScan= 'new' | 'old';

export interface AssetInScan extends Coin {
    relationToScan: RelationToScan;
}