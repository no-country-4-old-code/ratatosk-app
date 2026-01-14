import {CurrencyCoinShortedPipe} from '@app/shared/pipes/currency-coin-shorted.pipe';
import {lookupCurrencySymbol} from '@app/lib/coin/currency/unit';

describe('CurrencyCoinShortedPipe', () => {
    let pipe: CurrencyCoinShortedPipe;
    const basis = 1000;

    beforeEach(() => {
        pipe = new CurrencyCoinShortedPipe();
    });


    it('function transform should return $123,46K when given 123456', () => {
        const value = 123456;
        // act
        const result = pipe.transform(value, '$');
        // assert
        expect(result).toBe('$123.46K');
    });

    it('function transform should return -- when given NaN', () => {
        const value = NaN;
        // act
        const result = pipe.transform(value, '$');
        // assert
        expect(result).toBe('--');
    });

    it('function transform should return -€12,35M when given -12345678', () => {
        const value = -12345678;
        // act
        const result = pipe.transform(value, '€');
        // assert
        expect(result).toBe('-€12.35M');
    });

    it('function transform should return €0,00 when given 0', () => {
        const value = 0;
        // act
        const result = pipe.transform(value, lookupCurrencySymbol['eur']);
        // assert
        expect(result).toBe('€0.00');
    });


    it('function should return 0 if |value| < |basis|', () => {
        // assign
        const border = Math.pow(basis, 1);
        const val_max = border - 0.1;
        const val_min = -val_max;
        const val_standard = 123;
        const expected_result = 0;
        console.log(border, val_max, val_min, val_standard);
        // act
        const exp_min = pipe['getExponent'](val_min, basis);
        const exp_zero = pipe['getExponent'](0, basis);
        const exp_standard = pipe['getExponent'](val_standard, basis);
        const exp_max = pipe['getExponent'](val_max, basis);
        // assert
        expect(exp_min).toBe(expected_result);
        expect(exp_zero).toBe(expected_result);
        expect(exp_standard).toBe(expected_result);
        expect(exp_max).toBe(expected_result);
    });

    it('function should return 1 if |value| > |basis| and |value| < |2*basis|', () => {
        // assign
        const border = Math.pow(basis, 2);
        const val_max = border - 0.1;
        const val_min = -val_max;
        const val_standard = 123 + Math.pow(basis, 1);
        const expected_result = 1;
        console.log(border, val_max, val_min, val_standard);
        // act
        const exp_min = pipe['getExponent'](val_min, basis);
        const exp_standard = pipe['getExponent'](val_standard, basis);
        const exp_max = pipe['getExponent'](val_max, basis);
        // assert
        console.log(exp_min, exp_standard, exp_max);
        expect(exp_min).toBe(expected_result);
        expect(exp_standard).toBe(expected_result);
        expect(exp_max).toBe(expected_result);
    });


    it('function should return 2 if |value| > |basis| and |value| < |3*basis|', () => {
        // assign
        const border = Math.pow(basis, 3);
        const val_max = border - 0.1;
        const val_min = -val_max;
        const val_standard = 123 + Math.pow(basis, 2);
        const expected_result = 2;
        console.log(border, val_max, val_min, val_standard);
        // act
        const exp_min = pipe['getExponent'](val_min, basis);
        const exp_standard = pipe['getExponent'](val_standard, basis);
        const exp_max = pipe['getExponent'](val_max, basis);
        // assert
        expect(exp_min).toBe(expected_result);
        expect(exp_standard).toBe(expected_result);
        expect(exp_max).toBe(expected_result);
    });


    it('function should reduce value', () => {
        // assign
        const value = 123456789123;
        // act
        const value_normal = pipe['shrinkValue'](value, 0, basis);
        const value_K = pipe['shrinkValue'](value, 1, basis);
        const value_M = pipe['shrinkValue'](value, 2, basis);
        const value_G = pipe['shrinkValue'](value, 3, basis);
        const value_T = pipe['shrinkValue'](value, 4, basis);
        // assert
        expect(value_normal).toBe(value);
        expect(value_K).toBe(123456789.123);
        expect(value_M).toBe(123456.789123);
        expect(value_G).toBe(123.456789123);
        expect(value_T).toBe(0.123456789123);
    });


});
