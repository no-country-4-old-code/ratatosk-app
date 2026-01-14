import {AssetId} from '../../../datatypes/data';
import {AssetType} from '../../../asset/interfaces-asset';
import {createRangeArray} from '../../general/array';

export function getInvalidIds<T extends AssetType>(length = 100): AssetId<T>[] {
    return createRangeArray(length).map(value => `iNvAlId_dUmMy_Id_${value}` as AssetId<T>);
}