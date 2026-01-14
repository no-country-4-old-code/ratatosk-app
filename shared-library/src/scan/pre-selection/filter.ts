import {PreSelectionBlueprint} from './interfaces';
import {AssetType} from '../../asset/interfaces-asset';
import {buildPreSelectionManual} from './options/manual';
import {AssetId} from '../../datatypes/data';

export function filterByPreselection<T extends AssetType>(data: AssetId<T>[], blueprint: PreSelectionBlueprint<T>, assetType: AssetType): AssetId<T>[] {
    const isSelected = buildPreSelectionManual<T>(blueprint, assetType);
    return data.filter(d => isSelected(d));
}
