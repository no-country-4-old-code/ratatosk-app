import {TimeRange} from '../../datatypes/time';

const lookupTimeRange2Compression: { [range in TimeRange]: string } = {
    '3M': '0',
    '1M': '1',
    '1D': '2',
    '1Y': '3',
    '1W': '4',
    '5Y': '5'
};

const lookupCompression2TimeRange: { [compressed in string]: TimeRange } = {
    '0': '3M',
    '1': '1M',
    '2': '1D',
    '3': '1Y',
    '4': '1W',
    '5': '5Y'
};

export function compressTimeRanges(ranges: TimeRange[]): string[] {
    return ranges.map(range => lookupTimeRange2Compression[range]);
}

export function decompressTimeRanges(compressed: string[]): TimeRange[] {
    return compressed.map(comp => lookupCompression2TimeRange[comp]);
}
