import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Coin} from '@app/lib/coin/interfaces';
import {combineLatest, Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {rmvEndOfArrayToTimeRangeFrontendLength} from '@app/lib/coin/range-frontend/range-frontend';
import {lookupCurrencySymbol} from '@app/lib/coin/currency/unit';
import {materialIcons} from '@app/lib/global/icons';
import {History} from '../../../../../../../shared-library/src/datatypes/data';
import {calcDelta} from '../../../../../../../shared-library/src/functions/calc-delta';
import {AssetInfoExtended} from '@shared_library/asset/interfaces-asset';

interface SheetData {
    price: number;
    priceInBtc: number;
    priceChange1H: number;
    priceChange1D: number;
    priceChange7D: number;
    currency: string;
    currencySymbol: string;
    currencyBitcoin: string;
    currencySymbolBitcoin: string;
    supply: number;
    maxSupply: number;
    supplyDistribution: string;
    rank: number;
    marketCap: number;
    volume: number;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-coin-details-sheet',
    templateUrl: './coin-details-sheet.component.html',
    styleUrls: ['./coin-details-sheet.component.scss']
})
export class CoinDetailsSheetComponent implements OnInit {
    @Input() originCoin$: Observable<Coin>;
    @Input() history$: Observable<History<'coin'>>;
    public sheet$: Observable<SheetData>;
    public coinInfo$: Observable<AssetInfoExtended<'coin'>>;
    public readonly icons = materialIcons;

    ngOnInit() {
        const history$ = this.history$.pipe(shareReplay(1));
        this.coinInfo$ = this.getCoinInfo$(this.originCoin$);
        this.sheet$ = this.getSheet$(history$, this.coinInfo$);
    }

// private

    private getCoinInfo$(coin$: Observable<Coin>): Observable<AssetInfoExtended<'coin'>> {
        return coin$.pipe(
            map(coin => coin.info),
            shareReplay(1));
    }

    private getSheet$(history$: Observable<History<'coin'>>, info$: Observable<AssetInfoExtended<'coin'>>): Observable<SheetData> {
        return combineLatest(history$, info$).pipe(
            map(([history, info]) => {
                const price = history.price['1D'][0];
                const rank = history.rank['1D'][0];
                const volume = history.volume['1D'][0];
                const supply = history.supply['1D'][0];
                const marketCap = history.marketCap['1D'][0];
                return {
                    price: price,
                    priceInBtc: info.priceInBitcoin,
                    priceChange1H: calcDelta(price, rmvEndOfArrayToTimeRangeFrontendLength(history.price['1D'], '1H')),
                    priceChange1D: calcDelta(price, history.price['1D']),
                    priceChange7D: calcDelta(price, history.price['1W']),
                    currency: info.unit,
                    currencySymbol: lookupCurrencySymbol[info.unit],
                    currencyBitcoin: 'btc',
                    currencySymbolBitcoin: '₿',
                    supply,
                    maxSupply: info.maxSupply,
                    supplyDistribution: this.map2Percent(supply / info.maxSupply),
                    rank,
                    marketCap,
                    volume
                };
            })
        );
    }

    private map2Percent(result: number): string {
        let percent = '--';
        if (! isNaN(result)) {
            percent = `${result * 100.0}`.slice(0, 5) + '%';
        }
        return percent;
    }

}
