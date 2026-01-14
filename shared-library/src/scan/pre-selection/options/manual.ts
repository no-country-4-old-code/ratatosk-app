import {IsSelectedFunction, PreSelectionBlueprint} from '../interfaces';
import {AssetType} from '../../../asset/interfaces-asset';
import {AssetId} from '../../../datatypes/data';
import {mapPreselection2Ids} from '../../../functions/map-preselection-2-ids';

export function buildPreSelectionManual<T extends AssetType>(blueprint: PreSelectionBlueprint<T>, assetType: AssetType): IsSelectedFunction<AssetId<T>> {
    const ids = mapPreselection2Ids(blueprint, assetType);
    if (ids === undefined) {
        console.error('Bad blueprint for pre selection detected ', blueprint);
    }
    return (value: AssetId<T>) => ids.includes(value);
}
