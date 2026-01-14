import {TimeRangeFrontend} from '@app/lib/coin/interfaces';

type LookupFrontendRangeInfo = { [range in TimeRangeFrontend]: string };

export const lookupFrontendRangeInfo: LookupFrontendRangeInfo = {
    '1H': 'Display the last 60 minutes',
    '2H': 'Display the last 120 minutes',
    '4H': 'Display the last 4 hours',
    '12H': 'Display the last 12 hours',
    '1D': 'Display the last 24 hours',
    '3D': 'Display the last 3 days',
    '1W': 'Display the last 7 days',
    '1M': 'Display the last 31 days',
    '3M': 'Display the last 3 months',
    '6M': 'Display the last 6 months',
    '1Y': 'Display the last 12 months',
    '5Y': 'Display the last 5 years'
};
