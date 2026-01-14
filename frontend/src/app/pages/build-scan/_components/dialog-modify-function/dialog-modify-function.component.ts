import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, TemplateRef, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ParamOption, Params, ScopeInMin} from "@shared_library/scan/indicator-functions/params/interfaces-params";
import {SelectorBlueprint} from "@lib/components/abstract-selector";
import {MinMax} from "@shared_library/scan/indicator-functions/params/min-max";
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject} from "rxjs";
import {getParamOptions, getParamsWithDefaultValues} from "@shared_library/scan/indicator-functions/params/utils";
import {lookupParamInfo} from "@lib/indicator-functions/lookupParamInfo";
import {materialIcons} from "@lib/global/icons";
import {map, take} from "rxjs/operators";
import {
    getFactorMinMax,
    getScopes,
    getThresholdMinMax,
    getWeights
} from "@shared_library/scan/indicator-functions/params/get-params";
import {lookupScope2String} from "@shared_library/scan/indicator-functions/params/lookup-scope-string";
import {FunctionBlueprint, FunctionOption} from "@shared_library/scan/indicator-functions/interfaces";
import {getFunctionOptions, lookupIndicatorFunction} from "@shared_library/scan/indicator-functions/lookup-functions";
import {lookupFunctionInfo} from "@lib/indicator-functions/lookupFunctionInfo";
import {mapFuncOption2BeautifulString} from "@shared_library/scan/indicator-functions/map-to-string";
import {MetricHistory} from "@shared_library/datatypes/data";
import {createForEach} from "@shared_library/functions/general/for-each";


type LookupFunctionOption2Beautiful = {[opt in FunctionOption]: string};
type LookupTemplate = { [option in ParamOption]: TemplateData<any> };

export interface DialogFunctionParamsData {
  params: Params;
}

interface TemplateData<T> extends Partial<SelectorBlueprint<T>> {
  template: TemplateRef<any>;
  minMaxValues?: MinMax;
}

export interface DialogModifyFunctionData {
  functionBlueprint: FunctionBlueprint,
  metric: MetricHistory<any>
}


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dialog-modify-function',
  templateUrl: './dialog-modify-function.component.html',
  styleUrls: ['./dialog-modify-function.component.scss']
})
export class DialogModifyFunctionComponent implements AfterViewInit {
  @ViewChild('slider', {static: true}) tempRefSlider: TemplateRef<any>;
  @ViewChild('number', {static: true}) tempRefInputNumber: TemplateRef<any>;
  readonly options = getParamOptions();
  readonly lookupTemplate$: Observable<LookupTemplate>;
  readonly lookupFunctionOption2Beautiful: LookupFunctionOption2Beautiful;
  readonly icons = materialIcons;
  readonly lookupInfo = lookupParamInfo;
  private readonly selectedFunctionOption = new BehaviorSubject<FunctionOption>(undefined);
  private readonly selectedParams =  new BehaviorSubject<Params>(undefined);
  readonly section = {
    func: {
      options: getFunctionOptions(),
      old: undefined,
      selected$: this.selectedFunctionOption.asObservable(),
      optionsInfo: getFunctionOptions().map(opt => lookupFunctionInfo[opt]),
    },
    params: {
      options: getParamOptions(),
      old: undefined,
      selected$: this.selectedParams.asObservable(),
      optionsInfo: getParamOptions().map(opt => lookupParamInfo[opt]),
    }
  };
  readonly blueprint$ = this.getBlueprint$();
  private readonly subjectLookupTemplate = new ReplaySubject<LookupTemplate>(1);

  constructor(public dialogRef: MatDialogRef<DialogModifyFunctionComponent>, @Inject(MAT_DIALOG_DATA) private data: DialogModifyFunctionData) {
    console.log(data);
    // --- FUNCTION
    this.section.func.old = data.functionBlueprint.func;
    this.updateSelectedFunction(this.section.func.old);
    this.lookupFunctionOption2Beautiful = this.createLookupOption2Beautiful(this.data.metric);

    // --- PARAMS
    this.section.params.old = {...data.functionBlueprint.params};
    this.updateParamsPartial(this.section.params.old);
    this.lookupTemplate$ = this.subjectLookupTemplate.asObservable();

  }

  ngAfterViewInit(): void {
    const lookupTemplate = this.getLookupTemplate(this.section.params.selected$);
    this.subjectLookupTemplate.next(lookupTemplate);
  }

  selectFunctionAndGoNext(func: FunctionOption, stepper: any): void {
    this.updateSelectedFunction(func);
    this.updateParams2Supported(func);
    stepper.next();
  }

  selectParamsAndClose(params: Partial<Params>): void {
    this.updateParamsPartial(params);
  }

  // private


  private updateSelectedFunction(updated: FunctionOption): void {
    this.selectedFunctionOption.next(updated);
  }

  private updateParams2Supported(func: FunctionOption): void {
    const info = lookupIndicatorFunction[func]().getInfo();
    const defaultParams= getParamsWithDefaultValues(info.supportedParams);
    this.selectedParams.asObservable().pipe(
        take(1),
    ).subscribe(current => {
      const params = {};
      info.supportedParams.forEach(supported => {
        if (current[supported] !== undefined) {
          params[supported] = current[supported];
        } else {
          params[supported] = defaultParams[supported];
        }
      });
      // overwrite completly
      this.selectedParams.next(params);
    });
  }

  private updateParamsPartial(updated: Partial<Params>): void {
    this.selectedParams.asObservable().pipe(
        take(1),
    ).subscribe(params => this.selectedParams.next({...params, ...updated}));
  }

  private getBlueprint$(): Observable<FunctionBlueprint> {
    const sec = this.section;
    return combineLatest(sec.func.selected$, sec.params.selected$).pipe(
        map(([func, params]) => {
          return {func, params};
        })
    );
  }

  private createLookupOption2Beautiful(metric: MetricHistory<any>): LookupFunctionOption2Beautiful {
    return createForEach(this.section.func.options, (opt) => mapFuncOption2BeautifulString(opt, metric));
  }

  private setToDefault(param: ParamOption): void {
    const defaultParams = getParamsWithDefaultValues([param]);
    this.updateParamsPartial(defaultParams);
  }

  private getLookupTemplate(params$: Observable<Params>): LookupTemplate {
    return {
      scope: {
        template: this.tempRefSlider,
        options$: of(getScopes()),
        selected$: params$.pipe(map(params => ([params.scope]))),
        mapOption2String$: (scope: ScopeInMin) => of(lookupScope2String[scope]),
        onSelectionCallback: (scope: ScopeInMin[]) => this.updateParamsPartial({scope: scope[0]})
      },
      factor: {
        template: this.tempRefInputNumber,
        minMaxValues: getFactorMinMax(),
        selected$: params$.pipe(map(params => ([params.factor]))),
        mapOption2String$: (factor: number) => of(factor.toString()),
        onSelectionCallback: (factor: number[]) => this.updateParamsPartial({factor: factor[0]})
      },
      threshold: {
        template: this.tempRefInputNumber,
        minMaxValues: getThresholdMinMax(),
        selected$: params$.pipe(map(params => ([params.threshold]))),
        mapOption2String$: (threshold: number) => of(threshold.toString()),
        onSelectionCallback: (threshold: number[]) => this.updateParamsPartial({threshold: threshold[0]})
      },
      weight: {
        template: this.tempRefSlider,
        options$: of(getWeights()),
        selected$: params$.pipe(map(params => ([params.weight]))),
        mapOption2String$: (weight: number) => of(weight.toString()),
        onSelectionCallback: (weight: number[]) => this.updateParamsPartial({weight: weight[0]})
      }
    };
  }
}

