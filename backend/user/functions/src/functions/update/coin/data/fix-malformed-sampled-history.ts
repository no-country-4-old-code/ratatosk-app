import {History} from '../../../../../../../../shared-library/src/datatypes/data';
import {isHistoryInitialised} from '../../../../helper/get-initialised-coin-ids';
import {getTimeRanges} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {lookupNumberOfSamplesOfRange} from '../../../../../../../../shared-library/src/settings/sampling';
import {createArray} from '../../../../../../../../shared-library/src/functions/general/array';
import {TimeRange} from '../../../../../../../../shared-library/src/datatypes/time';

export function isSampledHistoryMalformed(history: History<'coin'>): boolean {
    // it was sampled but it is still not detected as initialised
    return !isHistoryInitialised(history);
}

export function fixMalformedSampledHistory(history: History<'coin'>): History<'coin'> {
    let lastValidPrice: number | undefined = undefined;
    getTimeRangesReversed().forEach(range => {
        const prices = history.price[range];
        if (lastValidPrice === undefined) {
            lastValidPrice = prices[0];
        } else {
            // the fact that lastValidPrice is set indicates that a higher range has samples
            if (prices.length > 0 && prices[0] !== undefined) {
                lastValidPrice = prices[0];
            }
            const numberOfMissingSamples = lookupNumberOfSamplesOfRange[range] - prices.length;
            const additionalSamples = createArray(numberOfMissingSamples, lastValidPrice);
            history.price[range] = [...additionalSamples, ...prices];
        }
    });
    // fallback if no values at all are within history
    if (history.price['1D'].length === 0) {
        history.price['1D'] = [NaN];
    }
    return history;
}

// private

function getTimeRangesReversed(): TimeRange[] {
    const timeRangesReversed = getTimeRanges();
    timeRangesReversed.reverse();
    return timeRangesReversed;
}
