import {
    getLookupNumberOfLowerValuesNeededForHigherValue,
    lookupNumberOfSamplesOfRange,
} from '../../../../../../../shared-library/src/settings/sampling';

describe('Test calculation of numbers of samples and needed values for sample creation', function () {

    it('should have correct number of samples for each sampled range (no overlap)', function () {
        const lookUp = lookupNumberOfSamplesOfRange;
        expect(lookUp['1D']).toEqual(12 * 24);
        expect(lookUp['1W']).toEqual(24 * (7 - 1));
        expect(lookUp['1M']).toEqual(4 * (31 - 7));
        expect(lookUp['3M']).toEqual(91 - 31);
        expect(lookUp['1Y']).toEqual(52 - 13);
        expect(lookUp['5Y']).toEqual(52 / 2 * (5 - 1));
    });

    it('should have correct buffer size to get needed number for average for create new coin', function () {
        const lookUp = getLookupNumberOfLowerValuesNeededForHigherValue();
        expect(lookUp['1D']).toEqual(1);
        expect(lookUp['1W']).toEqual(12);   // resolution change 12 * 5 min = 1 h
        expect(lookUp['1M']).toEqual(6);
        expect(lookUp['3M']).toEqual(4);
        expect(lookUp['1Y']).toEqual(7);
        expect(lookUp['5Y']).toEqual(2);
    });
});
