import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from "@lib/global/icons";
import {combineLatest, Observable, of} from "rxjs";
import {CompareOption, ConditionBlueprint} from "@shared_library/scan/condition/interfaces";
import {MetricCoinHistory} from "@shared_library/asset/assets/coin/interfaces";
import {CoinService} from "@app/services/coin.service";
import {MatDialog} from "@angular/material/dialog";
import {UserLastSelectionService} from "@app/services/user-last-selection.service";
import {distinctUntilChanged, filter, map, shareReplay, switchMap, take} from "rxjs/operators";
import {selectByIdx$} from "@lib/rxjs/select-by-idx$";
import {
    createSelectorCompare,
    createSelectorFunction,
    createSelectorMetric,
    SelectorExtended
} from "@app/pages/build-scan/_components/condition-modify/selectors";
import {FunctionBlueprint, FunctionOption} from "@shared_library/scan/indicator-functions/interfaces";
import {BuildConditionService} from "@app/services/build-condition.service";
import {getUnitSymbolOfAttribute} from "@lib/coin/currency/unit";
import {getCurrency$} from "@lib/multiple-used/get-currency$";
import {UserService} from "@app/services/user.service";
import {UserRoleService} from "@app/services/user-role.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-condition-modify',
  templateUrl: './condition-modify.component.html',
  styleUrls: ['./condition-modify.component.scss']
})
export class ConditionModifyComponent {
  readonly conditionIdx$: Observable<number>;
  readonly condition$: Observable<ConditionBlueprint<'coin'> | undefined>;
  readonly unitSymbol$: Observable<string>;
  readonly selectorCompare: SelectorExtended<CompareOption>;
  readonly selectorMetric: SelectorExtended<MetricCoinHistory>;
  readonly selectorFunctionLeft: SelectorExtended<FunctionOption>;
  readonly selectorFunctionRight: SelectorExtended<FunctionOption>;
  readonly functionLeft$: Observable<FunctionBlueprint>;
  readonly functionRight$: Observable<FunctionBlueprint>;
  readonly icons = materialIcons;
  readonly pageTitle = 'Modify Condition';

  constructor(public conditionService: BuildConditionService, private coinService: CoinService, private dialog: MatDialog,
              private lastUserSelection: UserLastSelectionService, private userService: UserService, private roleService: UserRoleService,
              private route: ActivatedRoute, private location: Location) {
    this.conditionIdx$ = this.getConditionIdx$();
    this.condition$ = this.getCondition$(this.conditionService.conditions$, this.conditionIdx$);
    this.unitSymbol$ = this.getUnitSymbol$(this.condition$);
    this.selectorCompare = createSelectorCompare(this.condition$, this.updateCondition);
    this.selectorMetric = createSelectorMetric(this.condition$, this.updateCondition, this.roleService);
    // right
    this.functionRight$ = this.getFunctionBlueprint$(this.condition$, 'right');
    const updateRight = this.createUpdateFunction('right', this.functionRight$);
    this.selectorFunctionRight = createSelectorFunction(this.functionRight$, this.condition$, updateRight, this.roleService);
    // left
    this.functionLeft$ = this.getFunctionBlueprint$(this.condition$, 'left');
    const updateLeft = this.createUpdateFunction('left', this.functionLeft$);
    this.selectorFunctionLeft = createSelectorFunction(this.functionLeft$, this.condition$, updateLeft, this.roleService);
    this.selectorFunctionLeft.mapOption2String$ = this.mapFirstLetterToBig$(this.selectorFunctionLeft.mapOption2String$);
  }

  onClickAtAppBar(element: string) {
    if (element === this.icons.back) {
      this.location.back();
    }
  }

  rmvConditionAndGoBack = (): void => {
    this.conditionIdx$.pipe(take(1)).subscribe(idx => {
      this.conditionService.remove(idx);
      this.location.back();
    });
  };


// private

  private getConditionIdx$(): Observable<number> {
    return this.route.paramMap.pipe(
        map(params => parseInt(params.get('idx'), 10)),
        distinctUntilChanged(),
        shareReplay());
  }

  private getCondition$(conditions$: Observable<ConditionBlueprint<any>[]>, idx$: Observable<number>): Observable<ConditionBlueprint<any>> {
    return conditions$.pipe(
        filter(conds => conds.length > 0),
        switchMap(conds => selectByIdx$(of(conds), idx$)),
        shareReplay(1)
    );
  }

  private getUnitSymbol$(selectedCondition$: Observable<ConditionBlueprint<'coin'>>): Observable<string> {
    const currency$ = getCurrency$(this.userService);
    const attribute$ = selectedCondition$.pipe(
        filter(condition => condition !== undefined),
        map(condition => condition.metric),
    );
    return combineLatest(attribute$, currency$).pipe(
        map(([attribute, currency]) => getUnitSymbolOfAttribute(currency, attribute)),
        distinctUntilChanged()
    );
  }

  private getFunctionBlueprint$(selectedCondition$: Observable<ConditionBlueprint<'coin'>>, selected: 'left' | 'right'): Observable<FunctionBlueprint> {
    const isRightSelected = selected === 'right';
    return selectedCondition$.pipe(
        filter(condition => condition !== undefined),
        map(condition => isRightSelected ? condition.right : condition.left),
        shareReplay(1));
  }

  private mapFirstLetterToBig$(mapOption2String$: (option: string) => Observable<string>) {
    const oldFunction$ = mapOption2String$;
    return (option => {
      return oldFunction$(option).pipe(
          map(str => `${str[0].toUpperCase()}${str.substring(1)}`)
      );
    });
  }

  private updateCondition = (modifier: (condition: ConditionBlueprint<'coin'>) => ConditionBlueprint<'coin'>) => {
    const idx$ = this.conditionIdx$.pipe(
        take(1)
    );
    const cond$ = this.condition$.pipe(
        take(1)
    );
    combineLatest(idx$, cond$).subscribe(([idx, condition]) => {
      const updated = modifier(condition);
      this.conditionService.update(updated, idx);
    });
  };

  private createUpdateFunction(selected: 'left' | 'right', selectedFunction$: Observable<FunctionBlueprint>) {
    return (modifier: (func: FunctionBlueprint) => FunctionBlueprint) => {
      selectedFunction$.pipe(
          take(1)
      ).subscribe(func => {
        const modifierCondition = (condition: ConditionBlueprint<'coin'>) => {
          const newFunc = {...modifier(func)};
          if (selected === 'right') {
            condition.right = newFunc;
          } else {
            condition.left = newFunc;
          }
          return condition;
        };
        this.updateCondition(modifierCondition);
      });
    };
  };
}
