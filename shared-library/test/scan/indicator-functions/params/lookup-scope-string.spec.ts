import {getScopes} from '../../../../src/scan/indicator-functions/params/get-params';
import {lookupScope2String} from '../../../../src/scan/indicator-functions/params/lookup-scope-string';
import {ScopeInMin} from '../../../../src/scan/indicator-functions/params/interfaces-params';

describe('Test lookup table scope2string', function () {

    it('should never thrown an error or have a undefined value ', function () {
        getScopes().forEach((scope: ScopeInMin) => {
            expect(() => lookupScope2String[scope]).not.toThrowError();
            expect(lookupScope2String[scope]).not.toBeUndefined();
        });
    });

    it('should return correct values', function () {
        expect(lookupScope2String[60]).toEqual('1H');
        expect(lookupScope2String[120]).toEqual('2H');
        expect(lookupScope2String[1440]).toEqual('1D');
        expect(lookupScope2String[2880]).toEqual('2D');
        expect(lookupScope2String[10080]).toEqual('1W');
        expect(lookupScope2String[40320]).toEqual('4W');
        expect(lookupScope2String[524160]).toEqual('1Y');
        expect(lookupScope2String[1048320]).toEqual('2Y');
    });

});
