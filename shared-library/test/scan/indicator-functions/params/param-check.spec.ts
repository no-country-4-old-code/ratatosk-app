import {lookupParamCheck} from '../../../../src/scan/indicator-functions/params/lookup-plausi-check';
import {getScopes} from '../../../../src/scan/indicator-functions/params/get-params';
import {ParamOption, Params, ScopeInMin} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {checkParams} from '../../../../src/scan/indicator-functions/params/param-check';
import {FunctionInfo, FunctionOption} from '../../../../src/scan/indicator-functions/interfaces';

describe('Test param check function', function () {

    function createFunctionInfo(params: ParamOption[], name: FunctionOption): FunctionInfo {
        return {name, supportedParams: params};
    }

    it('should only check given params', function () {
        const params: Params = {scope: 60};
        const info = createFunctionInfo(['scope'], 'test' as FunctionOption);
        expect(() => checkParams(params, info)).not.toThrowError();
    });

    it('should throw error if checked params are wrong', function () {
        const params: Params = {scope: 65 as ScopeInMin};
        const info = createFunctionInfo(['scope'], 'test' as FunctionOption);
        expect(() => checkParams(params, info)).toThrowError();
    });

    it('should throw error not-supported params are given (even when valid)', function () {
        const params: Params = {weight: 1, scope: 60};
        const info = createFunctionInfo(['scope'], 'test' as FunctionOption);
        expect(() => checkParams(params, info)).toThrowError();
    });

    it('should throw error if params are missing', function () {
        const params: Params = {weight: 1};
        const info = createFunctionInfo(['weight', 'scope'], 'test' as FunctionOption);
        expect(() => checkParams(params, info)).toThrowError();
    });
});


describe('Test param checks in lookup', function () {

    describe('Test check for factor', function () {
        const func = lookupParamCheck.factor;

        it('should return true if in range', function () {
            expect(func(0)).toBeTruthy();
            expect(func(0.0001)).toBeTruthy();
            expect(func(1)).toBeTruthy();
            expect(func(9.9999)).toBeTruthy();
            expect(func(10)).toBeTruthy();
        });

        it('should return false if not in range', function () {
            expect(func(-0.0001)).toBeFalsy();
            expect(func(10.0001)).toBeFalsy();
            expect(func(NaN)).toBeFalsy();
        });
    });

    describe('Test check for scope', function () {
        const func = lookupParamCheck['scope'];

        it('should return true for every value in scope', function () {
            getScopes().forEach((step: ScopeInMin) => {
                expect(func(step)).toBeTruthy();
            });
        });

        it('should return false for invalid values', function () {
            expect(func(NaN)).toBeFalsy();
            expect(func(undefined)).toBeFalsy();
            expect(func(0)).toBeFalsy();
            expect(func(-5)).toBeFalsy();
            expect(func(4)).toBeFalsy();
            expect(func(35)).toBeFalsy();
        });
    });

    describe('Test check for weight', function () {
        const func = lookupParamCheck.weight;

        it('should return true if value is supported', function () {
            expect(func(-5)).toBeTruthy();
            expect(func(-1)).toBeTruthy();
            expect(func(0)).toBeTruthy();
            expect(func(1)).toBeTruthy();
            expect(func(5)).toBeTruthy();
        });

        it('should return false not supported value', function () {
            expect(func(-6)).toBeFalsy();
            expect(func(-0.1)).toBeFalsy();
            expect(func(0.1)).toBeFalsy();
            expect(func(6)).toBeFalsy();
            expect(func(NaN)).toBeFalsy();
        });
    });

    describe('Test check for threshold', function () {
        const func = lookupParamCheck.threshold;

        it('should return true if in range', function () {
            expect(func(-1000000000)).toBeTruthy();
            expect(func(-1000000000 + 0.1)).toBeTruthy();
            expect(func(0)).toBeTruthy();
            expect(func(1)).toBeTruthy();
            expect(func(1000000000 - 0.1)).toBeTruthy();
            expect(func(1000000000)).toBeTruthy();
        });

        it('should return false if not in range', function () {
            expect(func(-1000000000.1)).toBeFalsy();
            expect(func(1000000000.1)).toBeFalsy();
            expect(func(NaN)).toBeFalsy();
        });
    });
});
