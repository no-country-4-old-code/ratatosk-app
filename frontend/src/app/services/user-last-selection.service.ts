import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TimeRangeFrontend} from '@lib/coin/interfaces';
import {AssetType} from '@shared_library/asset/interfaces-asset';
import {AssetId, MetricHistory} from '@shared_library/datatypes/data';
import {ColoredFunction} from '@lib/chart-data/interfaces';
import {SortRequestScanContent} from '@pages_scans/scan-content/interfaces';

interface ScreenAssetChart {
  timeRange: TimeRangeFrontend;
  metric: {[asset in AssetType]: MetricHistory<any>};
  coloredFunctions: ColoredFunction[];
}

interface ScreenConditionMenu {
  timeRange: TimeRangeFrontend;
  assetId: {[asset in AssetType]: AssetId<any>};
}

interface ScreenLogin {
  tabIndexSubject: BehaviorSubject<number>;
}

interface ScreenMainMenu {
  tabIndexSubject: BehaviorSubject<number>;
}

interface ScreenScanContent {
  lastSortRequest: SortRequestScanContent;
}

@Injectable({
  providedIn: 'root'
})
export class UserLastSelectionService {

  readonly screenAssetChart: ScreenAssetChart = {
    timeRange: '1D', // only use for startWtih
    metric: {
      coin: 'price'
    },
    coloredFunctions: [{
      color: undefined,
      blueprint: {func: 'value', params: {factor: 1}}
    }]
  };
  readonly screenConditionMenu: ScreenConditionMenu = {
    timeRange: '12H', // only use for startWtih
    assetId: {
      coin: 'bitcoin'
    }
  };
  readonly screenLogin: ScreenLogin = {
    tabIndexSubject: new BehaviorSubject<number>(0)
  };
  readonly screenMainMenu: ScreenMainMenu = {
    tabIndexSubject: new BehaviorSubject<number>(0)
  };
  readonly screenScanContent: ScreenScanContent  = {
    lastSortRequest: {metric: 'rank', ascending: true, forceNewIdsFirst: true}
  };


  constructor() { }
}
