import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {Coin, TimeRangeFrontend} from '@lib/coin/interfaces';
import {AssetId, History} from '@shared_library/datatypes/data';
import {ChartData, ColoredFunction} from '@lib/chart-data/interfaces';
import {MetricCoinHistory} from '@shared_library/asset/assets/coin/interfaces';
import {materialIcons} from '@lib/global/icons';
import {getTimeRangesFrontend} from '@lib/coin/range-frontend/range-frontend';
import {CoinService} from '@app/services/coin.service';
import {ScanService} from '@app/services/scan.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {UserRoleService} from '@app/services/user-role.service';
import {getPermittedOptions$} from '@lib/user-role/options/get-options';
import {allOptionsMetric, freeOptionsMetric} from '@lib/user-role/options/options';
import {debounceTime, distinctUntilChanged, map, shareReplay, startWith, switchMap} from 'rxjs/operators';
import {ScanFrontend} from '@lib/scan/interfaces';
import {areObjectsEqual} from '@shared_library/functions/general/object';
import {FunctionBlueprint} from '@shared_library/scan/indicator-functions/interfaces';
import {mapFuncBlueprint2String} from '@shared_library/scan/indicator-functions/map-to-string';
import {Meta} from '@shared_library/datatypes/meta';
import {getChart$} from '@lib/chart-data/line/chart';
import {debounceTimeInputMs} from '@lib/global/debounce-on-user-input';
import {UserLastSelectionService} from '@app/services/user-last-selection.service';
import {dyeFunctions} from '@lib/chart-data/line/color/dye-functions';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-asset-chart',
  templateUrl: './asset-chart.component.html',
  styleUrls: ['./asset-chart.component.scss']
})
export class AssetChartComponent implements OnInit {
  @Input() id: AssetId<any>;
  @Input() coin$: Observable<Coin>;
  history$: Observable<History<'coin'>>;
  chart$: Observable<ChartData>;
  timeRangeSelected$: Observable<TimeRangeFrontend>;
  metricSelected$: Observable<MetricCoinHistory>;
  timeRangeSelectedArray$: Observable<TimeRangeFrontend[]>;
  metricSelectedArray$: Observable<MetricCoinHistory[]>;
  functionsAvailable$: Observable<ColoredFunction[]>;
  functionsSelected$: Observable<ColoredFunction[]>;
  readonly icons = materialIcons;
  readonly metricsAvailable$: Observable<MetricCoinHistory[]>;
  readonly timeRangesAvailable$: Observable<TimeRangeFrontend[]> = of(getTimeRangesFrontend());
  private readonly initMetric: MetricCoinHistory = this.lastUserSelection.screenAssetChart.metric.coin;
  private readonly initTimeRange: TimeRangeFrontend = this.lastUserSelection.screenAssetChart.timeRange;
  private readonly initFunctions: ColoredFunction[] = this.lastUserSelection.screenAssetChart.coloredFunctions;
  private readonly functionSelectionSubject = new Subject<ColoredFunction[]>();
  private readonly metricSubject = new Subject<MetricCoinHistory>();
  private readonly timeRangeSubject = new Subject<TimeRangeFrontend>();
  private readonly simpleValueFunction: ColoredFunction = {
    color: undefined,
    blueprint: {func: 'value', params: {factor: 1}}
  };


  constructor(private coinService: CoinService, private scanService: ScanService, private route: ActivatedRoute,
              private location: Location, private roleService: UserRoleService, private lastUserSelection: UserLastSelectionService) {
    this.metricsAvailable$ = getPermittedOptions$(this.roleService, freeOptionsMetric, allOptionsMetric);
  }

  ngOnInit(): void {
    const historyWithMetaData$ = this.getCoinHistoryWithMetaData$(this.id);
    this.metricSelected$ = this.createFromSubject(this.metricSubject, this.initMetric);
    this.timeRangeSelected$ = this.createFromSubject(this.timeRangeSubject, this.initTimeRange);
    this.metricSelectedArray$ = this.map2Array$(this.metricSelected$);
    this.timeRangeSelectedArray$ = this.map2Array$(this.timeRangeSelected$);
    this.functionsAvailable$ = this.getAvailableFunctions$();
    const selectedChips$ = this.getSelectedChips(this.functionsAvailable$, this.initFunctions);
    this.history$ = this.getHistory$(historyWithMetaData$);
    this.chart$ = this.getChartShared$(historyWithMetaData$, this.timeRangeSelected$, this.metricSelected$, selectedChips$);
    this.functionsSelected$ = this.getFunctionsSelected$(selectedChips$);
  }

  onClickAtAppBar(element: string) {
    if (element === this.icons.back) {
      this.location.back();
    }
  }

  updateTimeRange(timeRange: TimeRangeFrontend) {
    this.lastUserSelection.screenAssetChart.timeRange = timeRange;
    this.timeRangeSubject.next(timeRange);
  }

  updateMetric(metric: MetricCoinHistory) {
    this.lastUserSelection.screenAssetChart.metric.coin = metric;
    this.metricSubject.next(metric);
  }

  selectFunctions(selectedChips: ColoredFunction[]) {
    this.lastUserSelection.screenAssetChart.coloredFunctions = selectedChips;
    this.functionSelectionSubject.next(selectedChips);
  }

  // private

  private getAvailableFunctions$(): Observable<ColoredFunction[]> {
    return this.getRelatedScan$().pipe(
        map((scan: ScanFrontend) => scan.conditions.flatMap(cond => [cond.left, cond.right])),
        map(funcBlueprints => [this.simpleValueFunction.blueprint, ...funcBlueprints]),
        map(this.filterUniqueFunctions),
        distinctUntilChanged((obj1, obj2) => areObjectsEqual(obj1, obj2)),
        map(funcBlueprints => funcBlueprints.map(blueprint => ({blueprint, color: undefined}))),
        shareReplay(1)
    );
  }

  private getSelectedChips(available$: Observable<ColoredFunction[]>, initSelection: ColoredFunction[]): Observable<ColoredFunction[]> {
    return available$.pipe(
        onlyFirstEmitWillPass(),
        switchMap(available => {
          const blueprintsAvailable = available.map(c => JSON.stringify(c.blueprint));
          const availableInit = initSelection.filter(c => blueprintsAvailable.includes(JSON.stringify(c.blueprint)));
          return this.createFromSubject(this.functionSelectionSubject, availableInit);
        }),
        shareReplay(1)
    );
  }

  private getFunctionsSelected$(selectedChips$: Observable<ColoredFunction[]>): Observable<ColoredFunction[]> {
    return this.dyeSelectedFunctions(selectedChips$);
  }

  private filterUniqueFunctions(funcBlueprints: FunctionBlueprint[]): FunctionBlueprint[] {
    const compareRef = funcBlueprints.map(bp => mapFuncBlueprint2String(bp.func, bp.params));
    const onlyUnique = (bp, index) => compareRef.indexOf(mapFuncBlueprint2String(bp.func, bp.params)) === index;
    return funcBlueprints.filter((bp, index) => onlyUnique(bp, index));
  }

  private getRelatedScan$(): Observable<ScanFrontend> {
    return this.getScanId$().pipe(
        switchMap(idx => this.scanService.getScan$(idx)));
  }

  private getScanId$(): Observable<number> {
    return this.route.paramMap.pipe(
        map(params => parseInt(params.get('scanId'), 10)));
  }

  private getCoinHistoryWithMetaData$(id: AssetId<any>): Observable<Meta<History<'coin'>>> {
    return this.coinService.getCoinHistoryWithMetaData(id).pipe(
        shareReplay(1)
    );
  }

  private getHistory$(historyWithMetaData$: Observable<Meta<History<'coin'>>>) {
    return historyWithMetaData$.pipe(
        map(historyWithMeta => historyWithMeta.payload));
  }

  private getChartShared$(historyWithMetaData$: Observable<Meta<History<'coin'>>>, timeRange$: Observable<TimeRangeFrontend>,
                          metric$: Observable<MetricCoinHistory>, functions$: Observable<ColoredFunction[]>): Observable<ChartData> {
    return getChart$(historyWithMetaData$, timeRange$, metric$, functions$).pipe(
        shareReplay(1));
  }

  private map2Array$<T>(stream$: Observable<T>): Observable<T[]> {
    return stream$.pipe(map(obj => [obj]));
  }

  private dyeSelectedFunctions(selection$: Observable<ColoredFunction[]>): Observable<ColoredFunction[]> {
    return selection$.pipe(
        map(selected => {
          const colors = dyeFunctions(selected.map(f => f.color));
          return selected.map((select, idx): ColoredFunction => ({
              color: colors[idx],
              blueprint: select.blueprint
            }));
          })
    );
  }

  private createFromSubject<T>(subject: Subject<T>, initValue: T): Observable<T> {
    return subject.asObservable().pipe(
        debounceTime(debounceTimeInputMs),
        startWith(initValue),
        distinctUntilChanged(),
        shareReplay(1)
    );
  }
}
