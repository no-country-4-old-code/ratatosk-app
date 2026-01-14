import {TimeRange} from '../../../../../shared-library/src/datatypes/time';
import {AssetId, Snapshot} from '../../../../../shared-library/src/datatypes/data';
import {AssetInfoExtended} from '@shared_library/asset/interfaces-asset';

export interface Coin {
    readonly id: AssetId<'coin'>;
    readonly info: AssetInfoExtended<'coin'>;
    readonly snapshot: Snapshot<'coin'>;
}

export type TimeRangeFrontend = '1H' | '2H' | '4H' | '12H' | '3D' | '6M' | TimeRange;
