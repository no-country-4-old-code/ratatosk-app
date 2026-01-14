import {PreSelectionBlueprint} from './pre-selection/interfaces';
import {AssetType} from '../asset/interfaces-asset';
import {AssetId} from '../datatypes/data';
import {ConditionBlueprint} from './condition/interfaces';

export interface Scan {
    title: string;
    id: number;
    iconId: number;
    asset: AssetType;
    conditions: ConditionBlueprint<'coin'>[];
    preSelection: PreSelectionBlueprint<'coin'>;
    notification: ScanNotification<'coin'>;
    result: AssetId<'coin'>[];
    timestampResultData: number;
}

export interface ScanNotification<ASSET_TYPE extends AssetType> {
    isEnabled: boolean;
    lastNotified: AssetId<ASSET_TYPE>[];
    lastSeen: AssetId<ASSET_TYPE>[];
}

