import {lookupParamDefaultValue} from '../../../../src/scan/indicator-functions/params/lookup-default-value';
import {ParamOption} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {getParamOptions, getParamsWithDefaultValues} from '../../../../src/scan/indicator-functions/params/utils';
import {lookupParamCheck} from '../../../../src/scan/indicator-functions/params/lookup-plausi-check';

describe('Test default values of params', function () {

    describe('Test creation of params filled with default values', function () {

        it('should return empty object if no params given', () => {
            const params = getParamsWithDefaultValues([]);
            expect(params).toEqual({});
        });

        it('should have 1 as default value for factor', () => {
            const paramFactor: ParamOption = 'factor';
            const params = getParamsWithDefaultValues([paramFactor]);
            expect(params).toEqual({'factor': 1});
        });

        it('should support multiple values', () => {
            const params = getParamsWithDefaultValues(['factor', 'weight']);
            expect(params).toEqual({'factor': 1, 'weight': 1});
        });

        it('should use lookup table for default values', () => {
            const allParamOptions = getParamOptions();
            const params = getParamsWithDefaultValues(allParamOptions);
            allParamOptions.forEach(name => expect(params[name]).toEqual(lookupParamDefaultValue[name]));
            expect(Object.keys(params).length).toEqual(allParamOptions.length);
        });
    });


    describe('Test if all default values are valid', function () {

        it('should pass plausibility checks', () => {
            getParamOptions().forEach(param => {
                const defaultValue = lookupParamDefaultValue[param];
                expect(lookupParamCheck[param](defaultValue)).toBeTruthy();
            });
        });
    });

});
