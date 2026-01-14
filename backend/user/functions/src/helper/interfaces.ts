import {Storage} from '../../../../../shared-library/src/datatypes/data';


export type CoinHistoryStorage = Storage<'coin', 'HISTORY'>;

export interface UpdateTimestamp {
    timestampMs: number;
    timestampMsRedundant: number;
}
