import {sampleGeckoHistory} from '../../../../src/functions/update/coin/data/sample-coin-history';
import {getSetOfElements} from '../../../../../../../shared-library/src/functions/general/array';
import {lookupGeckoResponseFetchRange} from '../../../test-utils/mocks/gecko/reponses';
import {geckoApi} from '../../../../src/helper/gecko/lib/api';
import {mapToPromise} from '../../../../../../../shared-library/src/functions/map-to-promise';
import {geckoRequestSettings} from '../../../../src/helper/gecko/lib/settings';
import {
    lookupNumberOfSamplesOfRange,
    lookupSampledDurationInMinutesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../shared-library/src/settings/sampling';
import {TimeRange, TimeSteps} from '../../../../../../../shared-library/src/datatypes/time';
import {AssetIdCoin, MetricCoinHistory} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';

import {getTimeRanges} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';


describe('Test sampling coin history from gecko', function () {
    const id: AssetIdCoin = 'bitcoin';
    const filledAttrs: MetricCoinHistory[] = ['price', 'volume', 'supply'];
    let spyCall: jasmine.Spy;

    function expectToBeFilled(steps: TimeSteps): void {
        getTimeRanges().forEach(range => {
            expect(steps[range].length).toEqual(lookupNumberOfSamplesOfRange[range]);
        });
    }

    function expectToBeEmpty(steps: TimeSteps): void {
        getTimeRanges().forEach(range => {
            expect(steps[range]).toEqual([]);
        });
    }

    beforeEach(function () {
        spyOn(geckoRequestSettings, 'getSleepTimeMs').and.returnValue(0);
        const ranges = getTimeRanges();
        spyCall = spyOn(geckoApi.coins, 'fetchMarketChartRange').and.callFake(() => {
            const range = ranges.shift() as TimeRange;
            return mapToPromise(lookupGeckoResponseFetchRange[range]);
        });
    });

    it('should call gecko web api once for each range with some puffer in requested minutes ' +
        'to make sure that enough samples are received', async function () {
        await sampleGeckoHistory(id);
        const getMin = (obj: any) => (obj.to - obj.from) / 60;
        const requestedMinutes = spyCall.calls.allArgs().map(timestampValue => getMin(timestampValue[1]));
        const expectedMinutes = getTimeRanges().map(range => {
            const puffer = 2 * lookupStepWidthInMinutesOfRange[range];
            return lookupSampledDurationInMinutesOfRange[range] + puffer;
        });
        expect(spyCall).toHaveBeenCalledTimes(getTimeRanges().length);
        expect(requestedMinutes).toEqual(expectedMinutes);
    });

    it('should fill steps of attributes with correct length', async function () {
        const result = await sampleGeckoHistory(id);
        filledAttrs.forEach(attr => expectToBeFilled(result[attr]));
        expectToBeEmpty(result.rank);
    });

    it('should map every value to its own range', async function () {
        // check if every range has unique samples to detect copy & paste bugs
        const result = await sampleGeckoHistory(id);
        filledAttrs.forEach(attr => {
            const firstValues = getTimeRanges().map(range => result[attr][range][0]);
            const uniqueFirstValues = getSetOfElements(firstValues);
            expect(firstValues).toEqual(uniqueFirstValues);
        });
    });

    it('should map every step object its own attribute', async function () {
        // check if every attribute has unique samples to detect copy & paste bugs
        const result = await sampleGeckoHistory(id);
        const firstValues = filledAttrs.map(attr => result[attr]['1D'][0]);
        const uniqueFirstValues = getSetOfElements(firstValues);
        expect(firstValues).toEqual(uniqueFirstValues);
    });
});
