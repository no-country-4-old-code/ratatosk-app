import {ForEach} from './for-each';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export type TimeSteps = ForEach<TimeRange, number[]>;

export type LookupTimeRange2Number = { [range in TimeRange]: number };
