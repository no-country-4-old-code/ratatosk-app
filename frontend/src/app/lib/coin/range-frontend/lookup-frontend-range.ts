import {TimeRange} from '../../../../../../shared-library/src/datatypes/time';
import {lookupNumberOfSamplesOfRange} from '../../../../../../shared-library/src/settings/sampling';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';


type LookupFrontendRange = { [range in TimeRangeFrontend]: TimeRange };
type LookupSamplesOfFrontendRange = { [range in TimeRangeFrontend]: number };

export const lookupFrontendRange2TimeRange: LookupFrontendRange = {
    '1H': '1D',
    '2H': '1D',
    '4H': '1D',
    '12H': '1D',
    '1D': '1D',
    '3D': '1W',
    '1W': '1W',
    '1M': '1M',
    '3M': '3M',
    '6M': '1Y',
    '1Y': '1Y',
    '5Y': '5Y'
};

export const lookupSamplesOfFrontendRange: LookupSamplesOfFrontendRange = {
    ...lookupNumberOfSamplesOfRange,
    '1H': 12,
    '2H': 24,
    '4H': 48,
    '12H': 144,
    '3D': 24 * 3,
    '6M': 28,
};
