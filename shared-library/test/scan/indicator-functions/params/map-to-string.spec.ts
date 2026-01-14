import {mapParams2String} from '../../../../src/scan/indicator-functions/params/map-to-string';
import {ParamOption, Params} from '../../../../src/scan/indicator-functions/params/interfaces-params';

describe('Test mapping a params to strings', function () {
    const params: Params = {factor: 1, scope: 60, weight: 1.5};
    const options = Object.keys(params) as ParamOption[];

    function act(expected: string, appliedParams: Params, excludedOptions: ParamOption[]): void {
        const result: string = mapParams2String(appliedParams, excludedOptions);
        expect(result).toEqual(expected);
    }

    it('should return empty string if no params given', () => {
        act('', {}, []);
    });

    it('should return empty string if all params excluded', () => {
        act('', params, options);
    });

    it('should return X if only X is contained', () => {
        act('1', {factor: 1}, []);
    });

    it('should use value of X in string', () => {
        act('2', {factor: 2}, []);
    });

    it('should return X if all other params excluded', () => {
        const excluded = options.filter(opt => opt !== 'factor');
        act('1', params, excluded);
    });

    it('should resolve scope in minutes to readable string (60 min => 1H)', () => {
        act('1H', {scope: 60}, []);
    });

    it('should resolve scope in minutes to readable string (120 min => 2H)', () => {
        act('2H', {scope: 120}, []);
    });

    it('should separate multiple params with ,', () => {
        act('1, 1H, 1.5', params, []);
    });
});
