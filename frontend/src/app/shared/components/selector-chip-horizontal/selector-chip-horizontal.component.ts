import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {FunctionBlueprint} from '../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {map} from 'rxjs/operators';
import {ColorChart, ColoredFunction} from '@app/lib/chart-data/interfaces';
import {mapFuncBlueprint2String} from '../../../../../../shared-library/src/scan/indicator-functions/map-to-string';
import {AbstractSelector} from '@app/lib/components/abstract-selector';
import {MetricCoinHistory} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {MetricHistory} from '@shared_library/datatypes/data';


interface Chip extends ColoredFunction {
	text: string;
}

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-selector-chip-horizontal',
	templateUrl: './selector-chip-horizontal.component.html',
	styleUrls: ['./selector-chip-horizontal.component.scss']
})
export class SelectorChipHorizontalComponent extends AbstractSelector<ColoredFunction> implements OnInit {
	@Input() attribute$: Observable<MetricCoinHistory>;
	chips$: Observable<Chip[]>;
	selectedChips$: Observable<Chip[]>;

	ngOnInit() {
		this.selectedChips$ = this.getSelectedChips$(this.selected$, this.attribute$);
		const options$ = this.getUncoloredChips$(this.options$, this.attribute$);
		this.chips$ = this.dyeChips$(options$, this.selectedChips$);
	}

	onElementSelection(clickedElement: Chip, oldSelection: Chip[]) {
		const newChipSelection = this.getNewSelection(clickedElement, oldSelection);
		const newSelection = newChipSelection.map(this.mapChip2ColoredFunc);
		this.onSelection.emit(newSelection);
	}


	// -------- private


	private getSelectedChips$(selected$: Observable<ColoredFunction[]>, metric$: Observable<MetricCoinHistory>): Observable<Chip[]> {
		return this.mapColoredFuncs$2Chips$(selected$, metric$);
	}

	private getUncoloredChips$(options$: Observable<ColoredFunction[]>, metric$: Observable<MetricHistory<any>>): Observable<Chip[]> {
		const chips$ = this.mapColoredFuncs$2Chips$(options$, metric$);
		return chips$.pipe(
			map(options => {
				const chips = options.map(chip => ({...chip, color: '' as ColorChart}));
				const labels = chips.map(chip => chip.text);
				const hasUniqueLabel = (chip, index) => labels.indexOf(chip.text) === index;
				return chips.filter(hasUniqueLabel);
			})
		);
	}

	private dyeChips$(chips$: Observable<Chip[]>, selectedChips$: Observable<Chip[]>): Observable<Chip[]> {
		return combineLatest(chips$, selectedChips$).pipe(
			map(([chips, selected]) => {
				return chips.map(chip => {
					return {...chip, color: this.getColor(chip, selected)};
				});
			}));
	}

	private getNewSelection(chip: Chip, oldSelection: Chip[]): Chip[] {
		let newSelection: Chip[] = [];
		if (this.isChipInChipArray(chip, oldSelection)) {
			newSelection = oldSelection.filter(c => c.text !== chip.text);
		} else {
			newSelection = [...oldSelection, {...chip, color: undefined}];
		}
		return newSelection;
	}

	private mapColoredFuncs$2Chips$(coloredFunc$: Observable<ColoredFunction[]>, metric$: Observable<MetricHistory<any>>): Observable<Chip[]> {
		return combineLatest(coloredFunc$, metric$).pipe(
			map(([coloredFunc, metric]) => coloredFunc.map(c => this.mapColoredFunc2Chip(c, metric)))
		);
	}

	private mapColoredFunc2Chip(coloredFunc: ColoredFunction, metric: MetricHistory<any>): Chip {
		return {
			blueprint: coloredFunc.blueprint,
			text: this.mapBlueprint2Text(coloredFunc.blueprint, metric),
			color: coloredFunc.color
		};
	}

	private mapChip2ColoredFunc(chip: Chip): ColoredFunction {
		return {
			blueprint: chip.blueprint,
			color: chip.color
		}
	}

	private getColor(chip: Chip, selected: Chip[]): ColorChart {
		const textArray = selected.map(c => c.text);
		let color: ColorChart = '' as ColorChart;
		if (textArray.includes(chip.text)) {
			const idx = textArray.indexOf(chip.text);
			color = selected[idx].color;
		}
		return color;
	}


	private isChipInChipArray(chip: Chip, chipArray: Chip[]): boolean {
		const textArray = chipArray.map(c => c.text);
		return textArray.includes(chip.text);
	}

	private mapBlueprint2Text(blueprint: FunctionBlueprint, attribute: MetricCoinHistory): string {
		if (blueprint.func === 'value') {
			return mapFuncBlueprint2String(blueprint.func, blueprint.params, attribute);
		}
		return mapFuncBlueprint2String(blueprint.func, blueprint.params);
	}

}
