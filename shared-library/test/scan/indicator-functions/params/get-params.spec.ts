import {getScopes, getWeights} from '../../../../src/scan/indicator-functions/params/get-params';
import {lookupStepWidthInMinutesOfRange} from '../../../../src/settings/sampling';
import {TimeRange} from '../../../../src/datatypes/time';
import {iterateOverRanges} from '../../../../src/scan/indicator-functions/helper/iterate-over-ranges';


describe('Test get params helper functions', function () {

    describe('Test valid values of scope', function () {

        it('should only support scope values which could be mapped to history without deviation caused by quantisation', function () {
            getScopes().forEach(scope => {
                const callback = (range: TimeRange, timeUsedInRange: number) => {
                    const quantisationError = timeUsedInRange % lookupStepWidthInMinutesOfRange[range];
                    const msg = `Quantisation error of ${quantisationError} for ${scope} in ${range} where ${timeUsedInRange} is left with step size ${lookupStepWidthInMinutesOfRange[range]}`;
                    expect(quantisationError === 0).toBeTruthy(msg);
                };
                iterateOverRanges(scope, callback);
            });
        });
    });

    describe('Test valid values of weight', function () {
        let weights: number[];

        beforeEach(function () {
            weights = getWeights();
        });

        it('should support more then 10 different options', function () {
            expect(weights.length).toBeGreaterThanOrEqual(10);
        });

        it('should support options -2, -1, 0, 1, 2', function () {
            [-2, -1, 0, 1, 2].forEach(weight => {
                expect(weights).toContain(weight);
            });
        });

        it('should be symmetric to 0', function () {
            const positiveWeights = weights.filter(w => w > 0);
            positiveWeights.forEach(weight => {
                expect(weights).toContain(-weight);
            });
        });
    });
});
