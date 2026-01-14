import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {areObjectsEqual, deepCopy} from '../../../../shared-library/src/functions/general/object';
import {distinctUntilChanged, map, shareReplay, take} from 'rxjs/operators';
import {ConditionBlueprint} from "@shared_library/scan/condition/interfaces";
import {BuildService} from "@app/services/build.service";
import {createDefaultCondition} from "@lib/multiple-used/create-default-condition";


@Injectable({
	providedIn: 'root'
})
export class BuildConditionService {
	readonly conditions$: Observable<ConditionBlueprint<any>[]>;
	private readonly conditionsSubject = new ReplaySubject<ConditionBlueprint<any>[]>(1);

	constructor(private build: BuildService) {
		this.conditions$ = this.conditionsSubject.asObservable().pipe(
			distinctUntilChanged((x, y) => areObjectsEqual(x, y)),
			map(conds => deepCopy(conds)),
			shareReplay(1)
		);
		this.reset();
	}

	reset = () => {
		this.build.currentBlueprint$.pipe(
			take(1)
		).subscribe(func => this.conditionsSubject.next(func.conditions));
	};

	add = () => {
		const callback = (conditions) => {
			let newCondition = createDefaultCondition();
			if (conditions.length > 0) {
				newCondition = deepCopy(conditions[conditions.length - 1]);
			}
			this.conditionsSubject.next([...conditions, newCondition]);
		};
		return this.runWithLatestConditions(callback);
	};

	update = (condition: Partial<ConditionBlueprint<any>>, index: number) => {
		const modify = (conditions: ConditionBlueprint<any>[]) => {
			conditions[index] = {...conditions[index], ...condition};
			return conditions;
		};
		return this.modifyCondition(index, modify);
	};

	remove = (index: number) => {
		const modify = (conditions: ConditionBlueprint<any>[]) => {
			conditions.splice(index, 1);
			return conditions;
		};
		return this.modifyCondition(index, modify);
	};

	write2ScanBlueprint = () => {
		const callback = (conditions: ConditionBlueprint<any>[]) => {
			this.build.update({conditions: [...conditions]});
		};
		this.runWithLatestConditions(callback);
	};

	private modifyCondition(index: number, callback: (conditions: ConditionBlueprint<any>[]) => ConditionBlueprint<any>[]): void {
		const modifier = (conditions) => {
			if (conditions.length > index) {
				conditions = callback(conditions);
				this.conditionsSubject.next(conditions);
			} else {
				console.error('Error during modify of condition: Index out of range!', index);
			}
		};
		this.runWithLatestConditions(modifier);
	}

	private runWithLatestConditions(callback: (conditions: ConditionBlueprint<any>[]) => void): void {
		this.conditions$.pipe(
			take(1),
		).subscribe(conditions => callback(conditions))
	}
}
