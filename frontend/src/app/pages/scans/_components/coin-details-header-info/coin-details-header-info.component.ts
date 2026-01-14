import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Coin, TimeRangeFrontend} from '@app/lib/coin/interfaces';
import {combineLatest, Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {lookupFrontendRange2TimeRange} from '@app/lib/coin/range-frontend/lookup-frontend-range';
import {
    rmvEndOfArrayToTimeRangeFrontendLength,
    wasExtendedRangeGiven
} from '@app/lib/coin/range-frontend/range-frontend';
import {getUnitSymbolOfAttribute} from '@app/lib/coin/currency/unit';
import {MetricCoinHistory} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {History} from '../../../../../../../shared-library/src/datatypes/data';
import {calcDelta} from '../../../../../../../shared-library/src/functions/calc-delta';
import {lowestTimeRange} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-coin-details-header-info',
    templateUrl: './coin-details-header-info.component.html'
})
export class CoinDetailsHeaderInfoComponent implements OnInit {
    @Input() coin$: Observable<Coin>;
    @Input() history$: Observable<History<'coin'>>;
    @Input() attribute$: Observable<MetricCoinHistory>;
    @Input() range$: Observable<TimeRangeFrontend>;
    public newValue$: Observable<number>;
    public unitSymbol$: Observable<string>;
    public delta$: Observable<number>;
    public info$: Observable<string>;


    constructor() {
    }

    ngOnInit() {
        const coin$ = this.coin$.pipe(shareReplay(1));
        const attribute$ = this.attribute$.pipe(shareReplay(1));
        const range$ = this.range$.pipe(shareReplay(1));
        const newValue$ = this.getValue$(this.history$, attribute$).pipe(shareReplay(1));
        this.newValue$ = newValue$;
        this.unitSymbol$ = this.getSymbol$(coin$, attribute$);
        this.delta$ = this.getDelta$(newValue$, attribute$, range$);
        this.info$ = this.getInfo$(attribute$, range$);
    }

    private getValue$(coin$: Observable<History<'coin'>>, attribute$: Observable<MetricCoinHistory>): Observable<number> {
        return combineLatest(coin$, attribute$).pipe(
            map(([history, attr]) => history[attr][lowestTimeRange][0])
        );
    }

    private getDelta$(newValue$: Observable<number>, attribute$: Observable<MetricCoinHistory>,
                      range$: Observable<TimeRangeFrontend>): Observable<number> {
        return combineLatest(newValue$, this.history$, attribute$, range$).pipe(
            map(params => this.calcAttributeDelta(...params))
        );
    }

    private getSymbol$(coin$: Observable<Coin>, attribute$: Observable<MetricCoinHistory>): Observable<string> {
        return combineLatest(coin$, attribute$).pipe(
            map(([coin, attribute]) => getUnitSymbolOfAttribute(coin.info.unit, attribute)));
    }

    private getInfo$(attribute$: Observable<MetricCoinHistory>, range$: Observable<TimeRangeFrontend>): Observable<string> {
        return combineLatest(attribute$, range$).pipe(
            map(([attribute, range]) => `${attribute} , ${range}`));
    }

    private calcAttributeDelta(newValue: number, history: History<'coin'>, attribute: MetricCoinHistory, range: TimeRangeFrontend): number {
        const oldValues = this.getOldValues(history, attribute, range);
        return calcDelta(newValue, oldValues);
    }

    private getOldValues(history: History<'coin'>, attribute: MetricCoinHistory, rangeFrontend: TimeRangeFrontend): number[] {
        const range = lookupFrontendRange2TimeRange[rangeFrontend];
        let values: number[] = history[attribute][range];
        if (values.length > 0) {
            if (wasExtendedRangeGiven(range, rangeFrontend)) {
                values = rmvEndOfArrayToTimeRangeFrontendLength<number>(values, rangeFrontend);
            }
        }
        return values;
    }
}

