import {SortRequest} from '@lib/coin/sort';

export interface SortRequestScanContent extends SortRequest {
    readonly forceNewIdsFirst?: boolean;
}