import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {lookupCoinInfo} from "@shared_library/asset/assets/coin/helper/lookup-coin-info-basic";
import {BehaviorSubject, Observable} from "rxjs";
import {AssetIdCoin} from "@shared_library/asset/assets/coin/interfaces";
import {TimeRangeFrontend} from "@lib/coin/interfaces";
import {CoinService} from "@app/services/coin.service";
import {MatDialog} from "@angular/material/dialog";
import {UserLastSelectionService} from "@app/services/user-last-selection.service";
import {debounceTime, distinctUntilChanged, map, shareReplay, switchMap, take} from "rxjs/operators";
import {
    DialogSelectOneAssetComponent
} from "@app/pages/build-scan/_components/dialog-select-one-asset/dialog-select-one-asset.component";
import {dialogWidth, updateOnDialogClose} from "@lib/util/dialog";
import {getTimeRangesFrontend} from "@lib/coin/range-frontend/range-frontend";
import {lookupFrontendRangeInfo} from "@lib/coin/range-frontend/lookup-range-info";
import {DialogSelectOneComponent} from "@shared_comp/dialog-select-one/dialog-select-one.component";
import {ChartBoolSample, ChartData} from "@lib/chart-data/interfaces";
import {ConditionBlueprint} from "@shared_library/scan/condition/interfaces";
import {getChartArray$} from "@lib/chart-data/line/chart";
import {createBoolSampleArray$} from "@lib/chart-data/bool/chart";
import {debounceTimeFixRace} from "@lib/global/debounce-on-user-input";
import {Meta} from "@shared_library/datatypes/meta";
import {History} from "@shared_library/datatypes/data";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-condition-charts',
    templateUrl: './condition-charts.component.html',
    styleUrls: ['./condition-charts.component.scss']
})
export class ConditionChartsComponent implements OnInit {
    @Input() selectedCondition$: Observable<ConditionBlueprint<any>>;
    chart$: Observable<ChartData>;
    chartBool$: Observable<ChartBoolSample[]>;
    readonly lookupCoin = lookupCoinInfo;
    readonly coinId$: Observable<AssetIdCoin>;
    readonly range$: Observable<TimeRangeFrontend>;
    private readonly subjectCoinId = new BehaviorSubject<AssetIdCoin>(this.lastUserSelection.screenConditionMenu.assetId.coin);
    private readonly subjectTimeRange = new BehaviorSubject<TimeRangeFrontend>(this.lastUserSelection.screenConditionMenu.timeRange);

    constructor(private coinService: CoinService, private dialog: MatDialog, private lastUserSelection: UserLastSelectionService) {
        this.coinId$ = this.subjectCoinId.asObservable().pipe(distinctUntilChanged());
        this.range$ = this.subjectTimeRange.asObservable().pipe(distinctUntilChanged());
    }

    ngOnInit() {
        this.chart$ = this.getChart$(this.coinId$, this.range$, this.selectedCondition$);
        this.chartBool$ = this.mapChart2Bool(this.chart$, this.selectedCondition$);
    }

    openDialogSelectCoin(): void {
        const fixedDialogHeight = '80%';  // to prevent auto adapt by dialog-content
        const dialogRef = this.dialog.open(DialogSelectOneAssetComponent, {
            width: dialogWidth,
            height: fixedDialogHeight
        });
        updateOnDialogClose<string>(dialogRef, (id: AssetIdCoin) => {
            this.lastUserSelection.screenConditionMenu.assetId.coin = id;
            this.subjectCoinId.next(id);
        });
    }

    openDialogSelectTimeRange(): void {
        const options = getTimeRangesFrontend();
        const optionsInfo = options.map(opt => lookupFrontendRangeInfo[opt]);
        const title = 'displayed time period';
        this.range$.pipe(
            take(1)
        ).subscribe(timeRange => {

            const dialogRef = this.dialog.open(DialogSelectOneComponent, {
                width: dialogWidth,
                data: {options, optionsInfo, title, selected: timeRange}
            });

            updateOnDialogClose<string>(dialogRef, (range: TimeRangeFrontend) => {
                this.lastUserSelection.screenConditionMenu.timeRange = range;
                this.subjectTimeRange.next(range)
            });
        });
    }

    // private

    private getChart$(id$: Observable<AssetIdCoin>, range$: Observable<TimeRangeFrontend>, condition$: Observable<ConditionBlueprint<any>>): Observable<ChartData> {
        const history$ = this.mapId2History(id$);
        const asArray$ = condition$.pipe(map(c => [c]));
        return getChartArray$(asArray$, history$, range$).pipe(
            map(arr => arr[0]),
            shareReplay(1)
        );
    }

    private mapChart2Bool(chart$: Observable<ChartData>, condition$: Observable<ConditionBlueprint<any>>): Observable<ChartBoolSample[]> {
        const lineArray$ = chart$.pipe(map(chart => [chart.data]));
        const options$ = condition$.pipe(map(cond => [cond.compare]));
        return createBoolSampleArray$(lineArray$, options$).pipe(
            debounceTime(debounceTimeFixRace), // solve race condition if change in condition$ result in change of chartArray$ and options$
            map(arr => arr[0]),
            shareReplay(1)
        );
    }

    private mapId2History(id$: Observable<AssetIdCoin>): Observable<Meta<History<'coin'>>> {
        return id$.pipe(
            switchMap(id => this.coinService.getCoinHistoryWithMetaData(id)));
    }
}
