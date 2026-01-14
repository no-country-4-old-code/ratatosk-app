import {createArray, createRangeArray} from '../../../../../../../../shared-library/src/functions/general/array';
import {FunctionBlueprint} from '../../../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {History} from '../../../../../../../../shared-library/src/datatypes/data';
import {applyFunctionsToSimulation} from '@app/lib/chart-data/line/simulation/run/run-all';
import {TimeRange} from '../../../../../../../../shared-library/src/datatypes/time';
import {
    lookupCompleteDurationInMinutesOfRange,
    lookupNumberOfSamplesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../../shared-library/src/settings/sampling';
import {lookupAssetFactory} from '../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetType} from '@shared_library/asset/interfaces-asset';
import {getTimeRanges} from '@shared_library/functions/time/get-time-ranges';


describe('Test simulation', function () {
    const attribute = 'price';
    const asset: AssetType = 'coin';
    let functionBlueprints: FunctionBlueprint[];
    let history: History<typeof asset>;

    beforeEach(function () {
        history = lookupAssetFactory[asset].createEmptyHistory();
        history[attribute]['1D'] = createRangeArray(lookupNumberOfSamplesOfRange['1D']);

        functionBlueprints = [
            {func: 'value', params: {factor: 1}},
            {func: 'average', params: {factor: 1, scope: 60}},
            {func: 'value', params: {factor: 2}},
        ];
    });

    it('should return empty array if no functions are given', function () {
        const displayedRange: TimeRange = '1D';
        const result = applyFunctionsToSimulation(history, attribute, displayedRange, []);
        expect(result).toEqual([]);
    });

    it('should calc simulation values (displayed range is 1D, higher ranges are empty)', function () {
        const displayedRange: TimeRange = '1D';
        const result = applyFunctionsToSimulation(history, attribute, displayedRange, functionBlueprints);
        const expectedFuncValue = createRangeArray(lookupNumberOfSamplesOfRange['1D']);
        const expectedFuncAverage = [
            ...createRangeArray(lookupNumberOfSamplesOfRange['1D'], 5.5).slice(0, lookupNumberOfSamplesOfRange['1D'] - 11),
            ...createArray(11, NaN)
        ];
        expect(result[0]).toEqual(expectedFuncValue);
        expect(result[1]).toEqual(expectedFuncAverage);
        expect(result[2]).toEqual(expectedFuncValue.map(ele => 2 * ele));
    });

    it('should calc simulation values (displayed range is 1D, higher ranges are filled)', function () {
        history[attribute]['1D'] = createArray(lookupNumberOfSamplesOfRange['1D'], 0);
        history[attribute]['1W'] = [12];
        const displayedRange: TimeRange = '1D';
        const result = applyFunctionsToSimulation(history, attribute, displayedRange, functionBlueprints);
        const expectedFuncAverage = [
            ...createArray(lookupNumberOfSamplesOfRange['1D'] - 11, 0),
            ...createRangeArray(11, 1)
        ];
        expect(result[1]).toEqual(expectedFuncAverage);
    });

    it('should calc simulation values (displayed range is 1W, higher ranges are partial filled)', function () {
        history[attribute]['1W'] = [-666, 12345, NaN, 42];
        const displayedRange: TimeRange = '1W';
        const result = applyFunctionsToSimulation(history, attribute, displayedRange, functionBlueprints);
        const numberOfSamples = lookupCompleteDurationInMinutesOfRange[displayedRange] / lookupStepWidthInMinutesOfRange[displayedRange];
        const expectedFrom1D = createRangeArray(24).map(ele => 12 * ele);
        const expectedFrom1W = [-666, 12345, NaN, 42];
        const expectedMissing = createArray(numberOfSamples - 28, NaN);
        const expectedFuncValue = [...expectedFrom1D, ...expectedFrom1W, ...expectedMissing];
        expect(result[0]).toEqual(expectedFuncValue);
        expect(result[2]).toEqual(expectedFuncValue.map(ele => 2 * ele));
    });

    it('should handle maximal displayed range with partial filled history', function () {
        history[attribute]['1W'] = createRangeArray(lookupNumberOfSamplesOfRange['1W']);
        history[attribute]['1M'] = createRangeArray(lookupNumberOfSamplesOfRange['1M']);
        const ranges = getTimeRanges();
        const maxRange = ranges[ranges.length - 1];
        const displayedRange: TimeRange = maxRange;
        // act
        const result = applyFunctionsToSimulation(history, attribute, displayedRange, functionBlueprints);
        // assert
        const numberOfSamples = Math.floor(lookupCompleteDurationInMinutesOfRange[maxRange] / lookupStepWidthInMinutesOfRange[maxRange]);
        expect(maxRange).toEqual('5Y'); // just to make sure
        expect(result.length).toEqual(3);
        result.forEach(samples => {
            expect(samples.length).toEqual(numberOfSamples);
            samples.slice(0, 3).forEach(n => expect(n).not.toBeNaN());
            samples.slice(3).forEach(n => expect(n).toBeNaN());
        });
    });
});
