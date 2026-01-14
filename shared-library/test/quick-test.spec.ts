import {createRangeArray} from '../src/functions/general/array';
import {average} from '../src/scan/indicator-functions/helper/math';
import {deepCopy} from '../src/functions/general/object';

describe('Quick and dirty checks', function () {

    it('type something', async function () {

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {performance} = require('perf_hooks');
        const array = [1, 2, 3];
        const obj = {'miau': [1, 2, 3, {'harr': 12}, 'miau2'], 'uff': 3};
        const obj2 = deepCopy(obj);
        console.log(obj, obj2);
        const t1 = performance.now();
        const array2 = createRangeArray(288).map(idx => average(array.slice(idx, idx + 120960)));
        console.log(array2.length, array.length);
        const t2 = performance.now();
        console.log(t2 - t1, 'ms');
    });

});
