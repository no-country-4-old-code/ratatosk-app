import {CurrencyCoinPipe} from '@app/shared/pipes/currency-coin.pipe';

describe('CurrencyCoinPipe', () => {
    it('create an instance', () => {
        const pipe = new CurrencyCoinPipe();
        expect(pipe).toBeTruthy();
    });
});
