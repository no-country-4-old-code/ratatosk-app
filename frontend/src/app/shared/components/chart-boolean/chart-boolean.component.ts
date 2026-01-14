import {AfterViewInit, Component, ElementRef, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {ChartBoolSample} from '@app/lib/chart-data/interfaces';
import {combineLatest, from, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ChartMixin} from '@app/lib/components/mixin-chart';
import {marginChartLine} from '@shared_comp/chart-line/chart-margin';
import {initSvg} from '@app/lib/chart-draw/init';
import {Axis, Margin, Size} from '@app/lib/chart-draw/interfaces';
import {getSizeChart} from '@app/lib/chart-draw/size';
import {average} from '../../../../../../shared-library/src/scan/indicator-functions/helper/math';
import {importD3, ImportD3} from "@shared_comp/chart-line/import-d3";


@Component({
	selector: 'app-chart-boolean',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './chart-boolean.component.html',
	styleUrls: ['./chart-boolean.component.scss']
})
export class ChartBooleanComponent extends ChartMixin implements AfterViewInit {
	@Input() samples$: Observable<ChartBoolSample[]>;
	@ViewChild('chart') private wrapperElement: ElementRef;

	private readonly domain = [0, 1];
	private readonly domainCenterLine = average(this.domain);
	private readonly marginChartBool: Margin = {top: 0, bottom: 0, right: marginChartLine.right, left: marginChartLine.left};
	private d3Import: ImportD3;

	ngAfterViewInit() {
		const importD3$ = from(importD3());
		const trigger$ = this.subjectExternalReDrawTrigger.asObservable();
		combineLatest(trigger$, this.samples$, importD3$).pipe(
			this.takeUntilDestroyed(),
			tap(x => console.log('Redraw chart-data boolean !', x))
		).subscribe(([trigger, samples, importedD3]) => {
			this.d3Import = importedD3;
			this.initChart(samples);
		});
	}

	private initChart(samples) {
		if (samples.length > 0) {
			this.createChart(samples);
		} else {
			this.showNoData();
		}
	}

	private createChart(samples: ChartBoolSample[]): void {
		const svg = initSvg(this.marginChartBool, this.d3Import, this.wrapperElement.nativeElement);
		const sizeChart = getSizeChart(this.wrapperElement, this.marginChartBool);
		const axis = this.initAxis(sizeChart, samples);
		this.drawLines(svg, axis, samples);
	}

	private initAxis(sizeChart: Size, data: ChartBoolSample[]): Axis {
		const xAxis = this.d3Import.d3Scale.scaleTime().range([0, sizeChart.width]);
		const yAxis = this.d3Import.d3Scale.scaleLinear().range([0, sizeChart.height]);
		xAxis.domain(this.d3Import.d3Array.extent(data, (d) => d.x));
		yAxis.domain(this.domain);
		return {x: xAxis, y: yAxis};
	}

	private drawLines(svg: any, axis: Axis, samples: ChartBoolSample[]) {
		const area = this.getGeneratorArea(axis);
		const background = this.getGeneratorBackground(axis);

		svg.append('path')
			.attr('class', 'color-condition-no-match')
			.attr('d', background(samples));

		svg.append('path')
			.attr('class', 'color-condition-match')
			.attr('d', area(samples));
	}

	private getGeneratorBackground(axis: Axis): any {
		const widthOfBackground = 0.5 * this.domain[1];
		return this.getGenerator(axis)
			.y0(axis.y(this.domainCenterLine - widthOfBackground / 2))
			.y1(axis.y(this.domainCenterLine + widthOfBackground / 2));
	}

	private getGeneratorArea(axis: Axis): any {
		return this.getGenerator(axis)
			.y0((d: ChartBoolSample) => axis.y(this.domainCenterLine - this.mapBool2DomainCenterLine(d.y)))
			.y1((d: ChartBoolSample) => axis.y(this.domainCenterLine + this.mapBool2DomainCenterLine(d.y)));
	}

	private getGenerator(axis: Axis): any {
		return this.d3Import.d3Shape.area()
			.defined(d => d !== undefined)
			//.curve(d3Shape.curveStep)
			.x((d: ChartBoolSample) => axis.x(d.x));
	}


	private showNoData(): void {
		// clear failure
		initSvg(this.marginChartBool, this.d3Import, this.wrapperElement.nativeElement);
	}

	private mapBool2DomainCenterLine(isActive: boolean): number {
		return isActive ? this.domainCenterLine : 0;
	}
}
