import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Location} from '@angular/common';
import {materialIcons} from '@app/lib/global/icons';
import {BuildConditionService} from "@app/services/build-condition.service";
import {ActivatedRoute, Router} from "@angular/router";
import {combineLatest, Observable} from "rxjs";
import {UserRoleService} from "@app/services/user-role.service";
import {UserRole} from "@lib/user-role/permission-check/interfaces";
import {ConditionBlueprint} from "@shared_library/scan/condition/interfaces";
import {distinctUntilChanged, map} from "rxjs/operators";
import {lookupPermission} from "@lib/user-role/permission-check/lookupPermissionCheck";
import {maxNumberOfConditions} from "@shared_library/scan/settings";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-conditions',
    templateUrl: './conditions.component.html',
    styleUrls: ['./conditions.component.scss']
})
export class ConditionsComponent  {
    restrictionReason$: Observable<string>;
    readonly pageTitle = 'all conditions';
    readonly icons = materialIcons;

    constructor(public conditionService: BuildConditionService, private location: Location, private router: Router,
                private route: ActivatedRoute, private roleService: UserRoleService,) {
        this.restrictionReason$ = this.getRestrictionReason$(this.roleService.role$, this.conditionService.conditions$);
    }

    onClickAtAppBar(element: string) {
        if (element === this.icons.clear) {
            this.location.back();
        }
    }

    goToModify(idx: number): void {
        this.router.navigate([`modify/${idx}/`], {relativeTo: this.route})
    }

    checkIfConditionHasChanged(index, condition){
        return JSON.stringify(condition);
    }

    updateAndReturn() {
        this.conditionService.write2ScanBlueprint();
        this.location.back();
    }

    private getRestrictionReason$(role$: Observable<UserRole>, conditions$: Observable<readonly ConditionBlueprint<'coin'>[]>): Observable<string> {
        return combineLatest(role$, conditions$).pipe(
            map(([userRole, conditions]) => {
                const result = lookupPermission.addCondition[userRole]({
                    numberOfScanBlueprints: -1,
                    numberOfConditionsOfScan: conditions.length
                });
                let reason = result.reason;
                if (conditions.length >= maxNumberOfConditions) {
                    reason = 'Maximum number of condition per filter is reached';
                }
                console.log('Reason ', reason, reason.length);
                return reason;
            }),
            distinctUntilChanged());
    }
}
