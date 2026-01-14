import {getKeysAs} from '../../functions/general/object';
import {AssetType} from '../interfaces-asset';

export function getAssets(): AssetType[] {
    const dummy: { [asset in AssetType]: null } = {'coin': null};
    return getKeysAs<AssetType>(dummy);
}
