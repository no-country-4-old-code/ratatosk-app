import {mapFuncBlueprint2String} from '../../../src/scan/indicator-functions/map-to-string';
import {Params} from '../../../src/scan/indicator-functions/params/interfaces-params';
import {FunctionOption} from '../../../src/scan/indicator-functions/interfaces';

describe('Test mapping a function blueprint to string', function () {
    let params: Params;
    let funcOption: FunctionOption;

    function act(expected: string, appliedParams: Params, overwriteFuncName?: string): void {
        const result = mapFuncBlueprint2String(funcOption, appliedParams, overwriteFuncName);
        expect(result).toEqual(expected);
    }

    beforeEach(function () {
        params = {factor: 1, scope: 60};
    });

    describe('Test with pure ', function () {

        beforeEach(function () {
            funcOption = 'value';
        });

        it('should return basic pure without factor, scope and attribute', function () {
            act('value', params);
        });

        it('should overwrite function name if given', function () {
            act('miauMiau123', params, 'miauMiau123');
        });

        it('should apply factor if !== 1 (factor = -0.5)', function () {
            params.factor = -0.5;
            act('-0.5 * value', params);
        });

        it('should apply factor if !== 1 (factor = -1)', function () {
            params.factor = -1;
            act('-1 * value', params);
        });

        it('should apply factor if !== 1 (factor = 2)', function () {
            params.factor = 2;
            act('2 * value', params);
        });
    });


    describe('Test with average ', function () {

        beforeEach(function () {
            funcOption = 'average';
        });

        it('should return average with scope and without factor and attribute', function () {
            act('average(1H)', params);
        });

        it('should return average with scope of 2H when 120min given', function () {
            params.scope = 120;
            act('average(2H)', params);
        });

        it('should apply factor if !== 1 (factor = 0.5)', function () {
            params.factor = 0.5;
            act('0.5 * average(1H)', params);
        });

    });

});
