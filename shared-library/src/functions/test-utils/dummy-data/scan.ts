import {
    createDummyConditionAlwaysFalse,
    createDummyConditionAlwaysTrue,
    createDummyConditionSpecific
} from './condition';
import {createRangeArray} from '../../general/array';
import {Scan} from '../../../scan/interfaces';
import {AssetType} from '../../../asset/interfaces-asset';
import {lookupAssetFactory} from '../../../asset/lookup-asset-factory';


export function createDummyScanAlwaysTrue(assetType: AssetType = 'coin'): Scan {
    const search = createEmptyScan(assetType);
    search.conditions = [createDummyConditionAlwaysTrue()];
    return search;
}

export function createDummyScanAlwaysFalse(assetType: AssetType = 'coin'): Scan {
    const search = createEmptyScan(assetType);
    search.conditions = [createDummyConditionAlwaysFalse()];
    return search;
}

export function createDummyScan(factor = 0, assetType: AssetType = 'coin'): Scan {
    const search = createEmptyScan(assetType);
    const params1 = {factor: 1};
    const params2 = {factor};
    search.conditions = [createDummyConditionSpecific('value', params1, '<', 'value', params2)];
    return search;
}


export function createEmptyScan(assetType: AssetType = 'coin'): Scan {
    return {
        title: 'Miau',
        id: 0,
        iconId: 0,
        asset: assetType,
        conditions: [],
        preSelection: lookupAssetFactory[assetType].createDefaultPreSelection(),
        notification: {
            isEnabled: true,
            lastSeen: [],
            lastNotified: []
        },
        result: [],
        timestampResultData: 0
    };
}

export function createDummyScans(numberOfScans: number, seed = 0): Scan[] {
    return createRangeArray(numberOfScans).map(count => {
        const id = seed + count;
        const scan = createDummyScan(id);
        scan.title = 'Dummy' + id.toString();
        scan.iconId = id;
        scan.id = id;
        return scan;
    });
}
