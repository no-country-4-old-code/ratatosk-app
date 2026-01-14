import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {getAttributesWhichHaveNoCurrency} from '@app/lib/coin/currency/unit';
import {changeHistoryCurrency, changeSnapshotCurrency} from '@app/lib/coin/currency/map-to-different-currency';
import {Currency} from '../../../../../../shared-library/src/datatypes/currency';
import {getCurrencies} from '../../../../../../shared-library/src/functions/currency';
import {MetaData} from '../../../../../../shared-library/src/datatypes/meta';
import {getDummyExchangeRates} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/currency';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {History, Snapshot} from '../../../../../../shared-library/src/datatypes/data';
import {createTimeSteps} from '../../../../../../shared-library/src/functions/time/steps';

describe('Test mapping of currency', function () {
    const currencies: Currency[] = getCurrencies();
    const defaultUnit: Currency = 'usd';
    const defaultValue = 1;
    let meta: MetaData;

    beforeEach(function () {
        meta = {
            timestampMs: 123456,
            unit: defaultUnit,  // unit on which ratesTo is based on
            ratesTo$: {...getDummyExchangeRates(), ...{'usd': 1, 'eur': 2, 'dkk': 0.5}},
        };
    });

    describe('Test map of history', function () {
        let lookupHistory: MarbleLookup<History<'coin'>>;

        beforeEach(function () {
            lookupHistory = {};
            (lookupHistory['usd'] as any) = assetCoin.createDummyHistory(meta.ratesTo$['usd']);
            (lookupHistory['usd'] as any) = createTimeSteps(0); // this skips market cap test

            getCurrencies().forEach(currency => {
                (lookupHistory[currency] as any) = assetCoin.createDummyHistory(meta.ratesTo$[currency]);
                (lookupHistory[currency] as any).rank = {...lookupHistory['usd'].rank};
                (lookupHistory[currency] as any).supply = {...lookupHistory['usd'].supply};
                (lookupHistory[currency] as any).redditScore = {...lookupHistory['usd'].redditScore};
                (lookupHistory[currency] as any).rsi = {...lookupHistory['usd'].rsi};
                (lookupHistory[currency] as any).marketCap = createTimeSteps(0);
            });
        });

        function act(src: Currency, dest: Currency) {
            meta.unit = src;
            const result = changeHistoryCurrency(lookupHistory[src], meta, dest);
            expect(result).toEqual(lookupHistory[dest]);
        }


        it('should apply factor to e.g. volume but not to supply', () => {
            lookupHistory['usd'].volume['1M'] = [2, 3, 4];
            lookupHistory['usd'].supply['1M'] = [2, 3, 4];
            const result = changeHistoryCurrency(lookupHistory['usd'], meta, 'eur');
            expect(result.volume['1M']).toEqual([4, 6, 8]);
            expect(result.supply['1M']).toEqual([2, 3, 4]);
        });

        it('should apply double factor to market cap', () => {
            lookupHistory['usd'].price['1M'] = [2, 3, 4];
            lookupHistory['usd'].supply['1M'] = [4, 3, 2];
            lookupHistory['usd'].marketCap['1M'] = [8, 9, 8];
            const result = changeHistoryCurrency(lookupHistory['usd'], meta, 'eur');
            expect(result.price['1M']).toEqual([4, 6, 8]);
            expect(result.supply['1M']).toEqual([4, 3, 2]);
            expect(result.marketCap['1M']).toEqual([16, 18, 16]);
        });

        it('should do nothing if current unit and dest unit are equal', () => {
            currencies.forEach(currency => {
                meta.ratesTo$ = {...getDummyExchangeRates(), ...{'usd': 100, 'eur': 100, 'dkk': 100}};
                meta.ratesTo$[currency] = 1;
                act(currency, currency);
            });
        });

        it('should apply factor to all attributes which refer to the currency', () => {
            currencies.forEach(dest => {
                act('usd', dest);
            });
        });

        it('should not change attributes which does not depend on currency', () => {
            const copy = lookupHistory['usd'];
            const result = changeHistoryCurrency(lookupHistory['usd'], meta, 'eur');
            getAttributesWhichHaveNoCurrency().forEach(attribute => {
                expect(result[attribute]).toEqual(copy[attribute]);
            });
        });
    });

    describe('Test map of snapshot', function () {
        let lookupSnapshot: MarbleLookup<Snapshot<'coin'>>;
        const defaultArray = [0, 1, 2, 3, 4];

        beforeEach(function () {
            lookupSnapshot = {};
            (lookupSnapshot['usd'] as any) = assetCoin.createDummySnapshot(defaultValue);

            getCurrencies().forEach(currency => {
                (lookupSnapshot[currency] as any) = assetCoin.createDummySnapshot(meta.ratesTo$[currency]);
                (lookupSnapshot[currency] as any).rank = defaultValue;
                (lookupSnapshot[currency] as any).delta = defaultValue;
                (lookupSnapshot[currency] as any).sparkline = defaultArray;
            });
        });

        function act(src: Currency, dest: Currency) {
            meta.unit = src;
            const result = changeSnapshotCurrency(lookupSnapshot[src], meta, dest);
            expect(result).toEqual(lookupSnapshot[dest]);
        }

        it('check test env', () => {
            expect(currencies.length).toBeGreaterThanOrEqual(3);
        });

        it('should create new object (even if no change occur)', () => {
            const snapshot = lookupSnapshot['usd'];
            const result = changeSnapshotCurrency(snapshot, meta, 'usd');
            (snapshot.price as any) = 123;
            expect(result.price).not.toEqual(snapshot.price);
        });

        it('should apply factor to e.g. price but not to rank', () => {
            lookupSnapshot['usd'].price = 1;
            lookupSnapshot['usd'].rank = 1;
            const result = changeSnapshotCurrency(lookupSnapshot['usd'], meta, 'eur');
            expect(result.price).toEqual(2);
            expect(result.rank).toEqual(1);
        });

        it('should use meta exchange rates if based on € when change from € to B', () => {
            (lookupSnapshot['eur'].price as any) = 1;
            meta.unit = 'eur';
            const result = changeSnapshotCurrency(lookupSnapshot['eur'], meta, 'dkk');
            expect(result.price).toEqual(0.5);
            expect(result.rank).toEqual(1);
        });

        it('should do nothing if current unit and dest unit are equal', () => {
            currencies.forEach(currency => {
                meta.ratesTo$ = {...getDummyExchangeRates(), ...{'usd': 100, 'eur': 100, 'dkk': 100}};
                meta.ratesTo$[currency] = 1;
                act(currency, currency);
            });
        });

        it('should apply factor to all attributes which refer to the currency', () => {
            currencies.forEach(dest => {
                act('usd', dest);
            });
        });

        it('should not change attributes which does not depend on currency', () => {
            const attrsSnapshot = assetCoin.getMetricsSnapshot();
            const result = changeSnapshotCurrency(lookupSnapshot['usd'], meta, 'eur');
            getAttributesWhichHaveNoCurrency()
                .filter(attr => attrsSnapshot.includes(attr as any))
                .forEach(attribute => {
                    let expected: any = defaultValue;
                    if (result[attribute].length !== undefined) {
                        // compare with array
                        expected = defaultArray;
                    }
                    expect(result[attribute]).toEqual(expected);
                });
        });
    });
});
