import {PreSelectionParameterOption} from '../scan/pre-selection/interfaces';
import {AssetId} from '../datatypes/data';
import {AssetType} from './interfaces-asset';

export interface PreSelectionParamHelper<T extends AssetType> {
    getOptions: () => PreSelectionParameterOption[]; // all options
    getDefaultOptions: () => PreSelectionParameterOption[]; // options for default element (in most case similar to getOptions)
    mapId2Options: (id: AssetId<T>) => PreSelectionParameterOption[]; // mapper to convert asset id to option e.g. id to categories
    getIconPath: (option: string) => string;
    getTitle: (option: string) => string;
}



