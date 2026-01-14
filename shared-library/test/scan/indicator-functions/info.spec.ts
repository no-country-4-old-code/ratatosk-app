import {getFunctionOptions, lookupIndicatorFunction} from '../../../src/scan/indicator-functions/lookup-functions';
import {FunctionOption} from '../../../src/scan/indicator-functions/interfaces';

describe('Test info of indicator functions', function () {
    let options: FunctionOption[];

    beforeEach(function () {
        options = getFunctionOptions();
    });

    it('every function option should have a function info with a name equals the option name', function () {
        options.forEach(opt => {
            const nameFromInfo = lookupIndicatorFunction[opt]().getInfo().name;
            expect(opt).toEqual(nameFromInfo);
        });
    });
});
