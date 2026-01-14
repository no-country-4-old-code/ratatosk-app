import {mapToPromise} from '../../../../../../shared-library/src/functions/map-to-promise';
import {withRetries} from '../../../src/helper/gecko/lib/helper';

describe('Test promise retry helper', function () {
    let count: number;

    beforeEach(function () {
        count = 0;
    });

    function createPromise(): Promise<string> {
        return mapToPromise('test').then(msg => {
            count++;
            throw new Error(msg);
        });
    }

    async function act(tries: number, defaultValue: string): Promise<void> {
        const result = await withRetries(createPromise, tries, defaultValue, 'miau');
        expect(result).toEqual(defaultValue);
        expect(count).toEqual(tries);
    }

    it('should try given times (0)', async function () {
        await act(0, 'huch');
    });

    it('should try given times (1)', async function () {
        await act(1, 'huch');
    });

    it('should try given times (3)', async function () {
        await act(3, 'huch');
    });

    it('should return given default value (3)', async function () {
        await act(3, '1234Har');
    });
});