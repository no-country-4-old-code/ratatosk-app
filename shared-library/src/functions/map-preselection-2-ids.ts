import {PreSelectionAssetParam, PreSelectionBlueprint} from '../scan/pre-selection/interfaces';
import {AssetType} from '../asset/interfaces-asset';
import {AssetId} from '../datatypes/data';
import {lookupAssetFactory} from '../asset/lookup-asset-factory';
import {PreSelectionParamHelper} from '../asset/interfaces-preselection';

export function mapPreselection2Ids<T extends AssetType>(blueprint: PreSelectionBlueprint<any>, assetType: AssetType): AssetId<T>[] {
    const asset = lookupAssetFactory[assetType];
    let ids = blueprint.manual;
    const params = asset.getPreSelectionAssetParams();

    params.forEach(param => {
        ids = filterIdsByAssetSpecificParam(param, ids, blueprint, assetType);
    });

    return ids as AssetId<T>[];
}

// private

function filterIdsByAssetSpecificParam(param: PreSelectionAssetParam<any>, ids: AssetId<any>[], blueprint: PreSelectionBlueprint<any>, assetType: AssetType): AssetId<any>[] {
    const asset = lookupAssetFactory[assetType];
    const helper = asset.getPreSelectionHelper(param as any);
    const optionsAll = helper.getOptions();
    const optionsSelected = blueprint[param];

    if (optionsAll.length === optionsSelected.length) {
        // only for performance
        return ids;
    } else {
        return filterByParam(ids, optionsSelected, helper);
    }
}

function filterByParam(ids: AssetId<any>[], optionsSelected: string[], helper: PreSelectionParamHelper<any>): AssetId<any>[] {
    return ids.filter(id => {
        const options = helper.mapId2Options(id);
        return options.some(option => optionsSelected.includes(option));
    });
}