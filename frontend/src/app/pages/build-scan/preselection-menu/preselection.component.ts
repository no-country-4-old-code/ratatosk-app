import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {materialIcons} from '@lib/global/icons';
import {combineLatest, Observable, of, ReplaySubject} from 'rxjs';
import {lookupCoinInfo} from '@shared_library/asset/assets/coin/helper/lookup-coin-info-basic';
import {distinctUntilChanged, map, shareReplay, take, throttleTime} from 'rxjs/operators';
import {ContentCategory} from '@app/pages/build-scan/_components/card-category/category-card.component';
import {AssetId} from '@shared_library/datatypes/data';
import {AssetType, LookupAssetInfo} from '@shared_library/asset/interfaces-asset';
import {BuildService} from '@app/services/build.service';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {PreSelectionAssetParam, PreSelectionBlueprint} from '@shared_library/scan/pre-selection/interfaces';
import {AssetIdCoin} from '@shared_library/asset/assets/coin/interfaces';
import {
    DialogPreselectionComponent,
    DialogPreselectionData,
    DialogPreselectionOptionData
} from '@app/pages/build-scan/_components/dialog-preselection/dialog-preselection.component';
import {dialogWidth, updateOnDialogClose} from '@lib/util/dialog';
import {mapPreselection2Ids} from '@shared_library/functions/map-preselection-2-ids';
import {areObjectsEqual, deepCopy} from '@shared_library/functions/general/object';
import {lookupAssetFactory} from '@shared_library/asset/lookup-asset-factory';
import {cluster2Groups} from '@shared_library/functions/general/cluster-to-groups';
import {AssetFactory} from '@shared_library/asset/interfaces-factory';
import {createForEach} from '@shared_library/functions/general/for-each';
import {areArraysEqual} from '@shared_library/functions/general/array';

export interface PreSelectionParamData<T extends AssetType> {
  name: PreSelectionAssetParam<T>;
  description: string;
  selected$: Observable<string[]>;
  content$: Observable<ContentCategory>;
  openDialog: (options: string[]) => void
}

type Param<T extends AssetType> = PreSelectionParamData<T>;

type DialogDataFunction = () => Observable<DialogPreselectionData>;
type Map2DialogFunction = (options: string[], idsOnDefault: string[], paramName: string) => DialogPreselectionOptionData[];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-preselection',
  templateUrl: './preselection.component.html',
  styleUrls: ['./preselection.component.scss']
})
export class PreselectionComponent implements OnInit {
  readonly pageTitle = 'Preselection';
  readonly icons = materialIcons;
  readonly ids$: Observable<AssetId<any>[]>;
  readonly iconGroups$: Observable<string[][]>;
  readonly preselectionSubject = new ReplaySubject<PreSelectionBlueprint<any>>(1);
  readonly params: Param<any>[];
  private readonly assetType: AssetType = 'coin';
  private readonly assetFactory: AssetFactory<any> = lookupAssetFactory[this.assetType];
  private readonly lookupAssetInfo: LookupAssetInfo<'coin'> = lookupCoinInfo;
  readonly idsAll = this.assetFactory.getIds();

  constructor(private build: BuildService, private location: Location, private dialog: MatDialog) {
    const blueprint$ = this.getBlueprint$();
    this.ids$ = this.getId$(blueprint$);
    this.iconGroups$ = this.getAssetIconGroups$(this.ids$);
    this.params = [...this.getParamsAssetSpecific(blueprint$), this.getParamManual(blueprint$)];
  }

  ngOnInit() {
    // constructor hold only passive connections, no push etc. --> easier to test
    this.load();
  }

  onClickAtAppBar(element: string) {
    if (element === this.icons.clear) {
      this.location.back();
    }
  }

  reset(optionName: string): void {
    this.build.currentBlueprint$.pipe(
        map(blueprint => blueprint.preSelection[optionName]),
        take(1)
    ).subscribe(value => {
      const partial: Partial<PreSelectionBlueprint<any>> = {};
      partial[optionName] = value;
      this.update(partial)
    });
  }

  updateAndReturn() {
    this.preselectionSubject.pipe(
        take(1)
    ).subscribe(preSelection => {
      this.build.update({preSelection: preSelection as PreSelectionBlueprint<'coin'>});
      this.location.back();
    });
  }

  // private

  private load(): void {
    this.build.currentBlueprint$.pipe(
        map(blueprint => blueprint.preSelection),
        take(1)
    ).subscribe(blueprint => this.preselectionSubject.next(blueprint));
  }

  private update(partial: Partial<PreSelectionBlueprint<any>>): void {
    this.preselectionSubject.asObservable().pipe(
        take(1)
    ).subscribe(blueprint => {
      const newBlueprint: PreSelectionBlueprint<any> = {...blueprint, ...partial};
      this.preselectionSubject.next(newBlueprint);
    })
  }

  private getBlueprint$(): Observable<PreSelectionBlueprint<any>> {
    return this.preselectionSubject.pipe(
        distinctUntilChanged((newObj, oldObj) => areObjectsEqual(newObj, oldObj)),
        map(blueprint => deepCopy(blueprint)),
        shareReplay(1)
    );
  }

  private getId$(blueprint$: Observable<PreSelectionBlueprint<any>>): Observable<AssetId<any>[]> {
    return blueprint$.pipe(
        map(blueprint => mapPreselection2Ids(blueprint, this.assetType))
    );
  }

  private getParamManual<T extends AssetType>(blueprint$: Observable<PreSelectionBlueprint<T>>): Param<T> {
    const name = 'manual';
    const optionsAvailable$ = blueprint$.pipe(
        map(blueprint => {
          // remove influence of manual itself from filter
          const modified: PreSelectionBlueprint<T> = {...blueprint, manual: this.assetFactory.getIds()};
          return mapPreselection2Ids(modified, this.assetType);
        }));
    const mapFunc = (ids: string[], _, param: PreSelectionAssetParam<any>) => this.mapIds2DialogOptionDataManual(ids, param);
    const getDialogData = () => this.buildDialogData(optionsAvailable$, of(null), name, mapFunc);
    return this.createParam(blueprint$, getDialogData, optionsAvailable$, name as any);
  }

  private getParamsAssetSpecific<T extends AssetType>(blueprint$: Observable<PreSelectionBlueprint<T>>): Param<T>[] {
    return this.assetFactory.getPreSelectionAssetParams().map((name: PreSelectionAssetParam<T>) => {
      const optionsAvailable$ = of(this.assetFactory.getPreSelectionHelper(name).getOptions());
      const idsAvailableOnDefault$ = this.getAvailableIdsWithoutInfluenceOfParm$(blueprint$, name);
      const mapFunc = (options: string[], ids: string[], param: PreSelectionAssetParam<any>) => this.mapIds2DialogOptionData(options, ids, param);
      const getDialogData = () => this.buildDialogData(optionsAvailable$, idsAvailableOnDefault$, name, mapFunc);
      return this.createParam(blueprint$, getDialogData, optionsAvailable$, name);
    });
  }

  private getAvailableIdsWithoutInfluenceOfParm$<T extends AssetType>(blueprint$: Observable<PreSelectionBlueprint<T>>, paramName: PreSelectionAssetParam<T>): Observable<AssetId<T>[]> {
    // The available asset ids depend on multiple params. For the dialog we want to display the number of ids which could be influenced by this parm
    return blueprint$.pipe(
        map(blueprint => {
          const clone = deepCopy(blueprint);
          // remove influence of current pre selection parameter
          clone[paramName] = this.assetFactory.getPreSelectionHelper(paramName).getOptions() as any;
          return mapPreselection2Ids<T>(blueprint, this.assetType)
        })
    );
  }

  private buildDialogData(optionsAvailable$: Observable<string[]>, idsAvailableOnDefault$: Observable<string[]>,  name: string, mapIds2Dialog: Map2DialogFunction): Observable<DialogPreselectionData> {
    const ids$ = idsAvailableOnDefault$.pipe(take(1));
    return combineLatest(ids$, optionsAvailable$).pipe(
        map(([ids, options]) => {
          return {
            title: `Select ${name}`,
            optionsSelected: [], // dummy value
            optionsAvailable: mapIds2Dialog(options, ids, name)
          };
        })
    );
  }

  private mapIds2DialogOptionDataManual(ids: string[], param: PreSelectionAssetParam<any>): DialogPreselectionOptionData[] {
    return ids.map(id => {
      return {
        id,
        iconPath: lookupCoinInfo[id].iconPath,
        title: lookupCoinInfo[id].name,
        sidetext: lookupCoinInfo[id].symbol,
      };
    });
  }

  private mapIds2DialogOptionData(options: string[], availableIds: string[], param: PreSelectionAssetParam<any>): DialogPreselectionOptionData[] {
    const helper = this.assetFactory.getPreSelectionHelper(param);
    const counter = createForEach(helper.getOptions(), () => 0);
    availableIds.forEach(id => {
      const options = helper.mapId2Options(id);
      options.forEach(option => {
        counter[option]++;
      });
    });
    const displayed = options.map(id => {
      return {
        id,
        iconPath: helper.getIconPath(id),
        title: helper.getTitle(id),
        sidetext: `${counter[id]}`,
      };
    });

    displayed.sort((a, b) => counter[b.id] - counter[a.id]);
    return displayed;
  }

  private createParam<T extends AssetType>(blueprint$: Observable<PreSelectionBlueprint<T>>, getDialogData: DialogDataFunction, availableOptions$: Observable<string[]>, param: PreSelectionAssetParam<T>): Param<T> {
    const selected$ = blueprint$.pipe(
        map(blueprint => blueprint[param]),
        distinctUntilChanged((newArray, oldArray) => areArraysEqual(newArray, oldArray)),
        shareReplay(1)
    );
    const content$ = combineLatest(selected$, availableOptions$).pipe(
        throttleTime(1),
        map( ([selected, available]) => this.mapOptions2Content(selected, available)),
        distinctUntilChanged((n, o) => n.info === o.info)
    );
    return {
      name: param,
      description: `${param[0].toUpperCase()}${param.substring(1)}`,   // better would be makeFirstLetterBigPipe
      selected$,
      content$,
      openDialog: (optionsSelected: string[]) => {
        getDialogData().pipe(
            take(1)
        ).subscribe(dialogData => {
            const dialogUpdated = {...dialogData, optionsSelected};
            this.openDialog(param, dialogUpdated);
        });
      }
    }
  }

  private mapOptions2Content(optionsActive: string[], optionsAvailable: string[]): ContentCategory {
      const optionsSelected = optionsActive.filter(option => optionsAvailable.includes(option));
      const isValid = optionsSelected.length > 0 || optionsAvailable.length === 0;
      const info = this.mapOptions2String(optionsSelected, optionsAvailable);
      return {info, isValid};
  }

  private mapOptions2String(optionsSelected: string[], optionsAvailable: string[]): string {
    let msg: string;
    if (optionsSelected.length === optionsAvailable.length) {
      msg = 'No restrictions';
    } else {
      msg = `${optionsSelected.length} selected`;
    }
    return msg;
  }

  private getAssetIconGroups$(ids$: Observable<AssetId<any>[]>): Observable<string[][]> {
    return ids$.pipe(
        map(ids => ids.map(id => this.lookupAssetInfo[id].iconPath)),
        map(icons => cluster2Groups(icons, 5))
    );
  }

  private openDialog(param: string, data: DialogPreselectionData): void {
    const dialogRef = this.dialog.open(DialogPreselectionComponent, {width: dialogWidth, data});
    const update = (newSelected: string[]) => {
      const partial = {};
      partial[param] = newSelected;
      this.update(partial);
    };
    updateOnDialogClose<AssetIdCoin[]>(dialogRef, update);
  }
}
