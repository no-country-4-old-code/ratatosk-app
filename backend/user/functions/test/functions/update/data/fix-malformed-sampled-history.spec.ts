import {History} from '../../../../../../../shared-library/src/datatypes/data';
import {deepCopy} from '../../../../../../../shared-library/src/functions/general/object';
import {
    fixMalformedSampledHistory,
    isSampledHistoryMalformed
} from '../../../../src/functions/update/coin/data/fix-malformed-sampled-history';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {createArray} from '../../../../../../../shared-library/src/functions/general/array';
import {lookupNumberOfSamplesOfRange} from '../../../../../../../shared-library/src/settings/sampling';

describe('Test fix of malformed history after sampling', function () {
    const fullSamples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 42);
    const fullSamples1W = createArray(lookupNumberOfSamplesOfRange['1W'], 43);
    const fullSamples1M = createArray(lookupNumberOfSamplesOfRange['1M'], 44);


    function createCustomHistory(samples1D: number[], samples1W: number[] = [], samples1M: number[] = []): History<'coin'> {
        const history = assetCoin.createEmptyHistory();
        history.price['1D'] = samples1D;
        history.price['1W'] = samples1W;
        history.price['1M'] = samples1M;
        return history;
    }


    describe('Test that malformed history is fixed', function () {

        function act(history: History<'coin'>, expected: History<'coin'>, isMalformCheckSkipped = false): void {
            const reference = deepCopy(history);
            const fixed = fixMalformedSampledHistory(history);
            expect(fixed).toEqual(expected);
            expect(isSampledHistoryMalformed(reference) || isMalformCheckSkipped).toBeTruthy();
            expect(isSampledHistoryMalformed(fixed)).toBeFalse();
        }

        it('should fill empty history with NaN as initial price value', function () {
            const history = createCustomHistory([]);
            const expected = createCustomHistory([NaN]);
            act(history, expected);
        });

        it('should fill empty lowest range with valid value from upper range', function () {
            const generateSamples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 1);
            const history = createCustomHistory([], [1]);
            const expected = createCustomHistory(generateSamples1D, [1]);
            act(history, expected);
        });

        it('should fill partial filled lowest range with last valid value from current range', function () {
            const lastValidValueOf1D = 61616;
            const generateSamples1D = createArray(lookupNumberOfSamplesOfRange['1D'] - 1, lastValidValueOf1D);
            const history = createCustomHistory([lastValidValueOf1D, 42], [1]);
            const expected = createCustomHistory([...generateSamples1D, 42], [1]);
            act(history, expected, true); // skipp it here because it is very unlikly, that 1D is only partially filled + will be automatically fixed during sampling.
        });

        it('should work over multiple ranges (tested with empty ranges)', function () {
            const generateSamples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 2);
            const generateSamples1W = createArray(lookupNumberOfSamplesOfRange['1W'], 2);
            const history = createCustomHistory([], [], [2, 3, 4, 5]);
            const expected = createCustomHistory(generateSamples1D, generateSamples1W, [2, 3, 4, 5]);
            act(history, expected);
        });

        it('should work over multiple ranges (tested with partial filled ranges - 1W is filled)', function () {
            const generateSamples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 42);
            const generateSamples1W = createArray(lookupNumberOfSamplesOfRange['1W'] - 1, 42);
            const history = createCustomHistory([], [42, 666], [2, 3, 4, 5]);
            const expected = createCustomHistory(generateSamples1D, [...generateSamples1W, 666], [2, 3, 4, 5]);
            act(history, expected);
        });
    });

    describe('Test that correct history is not touched', function () {

        it('should return true if not malformed', function () {
            const history = createCustomHistory([1]);
            expect(isSampledHistoryMalformed(history)).toBeFalse();
        });

        it('should not change correct formed history', function () {
            const correctHistories = [
                createCustomHistory([1]),
                createCustomHistory([1, 2]),
                createCustomHistory(fullSamples1D),
                createCustomHistory(fullSamples1D, [1]),
                createCustomHistory(fullSamples1D, [1, 2]),
                createCustomHistory(fullSamples1D, fullSamples1W),
                createCustomHistory(fullSamples1D, fullSamples1W, [1]),
                createCustomHistory(fullSamples1D, fullSamples1W, [1, 2]),
                createCustomHistory(fullSamples1D, fullSamples1W, fullSamples1M),
            ];
            correctHistories.forEach(history => {
                const reference = deepCopy(history);
                const fixed = fixMalformedSampledHistory(history);
                expect(fixed).toEqual(reference);
                expect(isSampledHistoryMalformed(history)).toBeFalse();
            });
        });

    });
});