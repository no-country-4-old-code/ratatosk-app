import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {ChartTooltip} from '@shared_comp/chart-line/chart-tooltip';
import {combineLatest, from, Observable, of} from 'rxjs';
import {ChartData, ChartLineSample} from '@app/lib/chart-data/interfaces';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';
import {marginChartLine} from '@shared_comp/chart-line/chart-margin';
import {ChartMixin} from '@app/lib/components/mixin-chart';
import {
    getNumberOfTicks,
    getTickFormatForY,
    lookupTickFormatByRange,
    lookupTicksByChartHeight,
    lookupTicksByChartWidth
} from '@app/lib/chart-draw/ticks';
import {getSizeChart, getSizeHostingSvg} from '@app/lib/chart-draw/size';
import {cleanAllSvgContent, initSvg} from '@app/lib/chart-draw/init';
import {Axis, Size} from '@app/lib/chart-draw/interfaces';
import {debounceTime, tap} from 'rxjs/operators';
import {importD3, ImportD3} from "@shared_comp/chart-line/import-d3";

export type ChartSize = 'medium' | 'small';

@Component({
	selector: 'app-coin-chart',
	encapsulation: ViewEncapsulation.None,  // need for apply styles ?!
	templateUrl: './chart-line.component.html',
	styleUrls: ['./chart-line.component.scss']
})
export class ChartLineComponent extends ChartMixin implements AfterViewInit, OnDestroy {
	@Input() chartData$: Observable<ChartData | undefined>;
	@Input() range$: Observable<TimeRangeFrontend>;
	@Input() selectedLineIdx$: Observable<number> = of(undefined);
	@Input() size: ChartSize = 'medium';
	@Input() noDataInfo: string = 'No data selected';
	@ViewChild('chart') private wrapperElement: ElementRef;
	private d3Import: ImportD3;

	ngAfterViewInit() {
		console.log('Create new');
		const importD3$ = from(importD3());
		const trigger$ = this.subjectExternalReDrawTrigger.asObservable();
		const chartDataDelayed$ = this.chartData$.pipe(debounceTime(1));  // resolve somehow bug "chart is not draw instant if chart data based on cache"
		combineLatest(trigger$, chartDataDelayed$, this.range$, this.selectedLineIdx$, importD3$).pipe(
			this.takeUntilDestroyed(),
			tap(x => console.log('Redraw chart-data !', x))
		).subscribe(([trigger, chartData, timeRange, selectedIdx, importedD3]) => {
			this.d3Import = importedD3;
			this.initChart(chartData, timeRange, selectedIdx);
		});
	}

	private initChart(chartData, timeRange, selectedIdx) {
		if (chartData !== undefined && chartData.data.length > 0) {
			this.createChart(chartData, timeRange, selectedIdx);
		} else {
			this.showNoData();
		}
	}

	private createChart(chartData: ChartData, timeRange: TimeRangeFrontend, selectedLineIdx: number) {
		const svg = initSvg(marginChartLine, this.d3Import);
		const sizeChart = getSizeChart(this.wrapperElement, marginChartLine);
		const axis = this.initAxis(sizeChart, chartData.data);
		this.drawAxis(svg, axis, sizeChart, timeRange);
		this.drawLines(svg, axis, chartData, selectedLineIdx);
		this.initTooltip(svg, axis, chartData);
	}

	private initTooltip(svg, axis: Axis, chartData: ChartData) {
		const tooltip = new ChartTooltip(svg, this.wrapperElement, axis, chartData, this.d3Import);
		this.d3Import.d3.select('svg')
			.on('touchstart', () => tooltip.makeTooltipsVisible())
			.on('touchend', () => tooltip.makeTooltipsInvisible())
			.on('touchmove', (event) => tooltip.updateTooltipsByTouch(event))
			.on('mouseover', () => tooltip.makeTooltipsVisible())
			.on('mouseout', () => tooltip.makeTooltipsInvisible())
			.on('mousemove', (event) => tooltip.updateTooltips(event));
	}

	private initAxis(sizeChart: Size, data: ChartLineSample[]): Axis {
		const xAxis = this.d3Import.d3Scale.scaleTime().range([0, sizeChart.width]);
		const yAxis = this.d3Import.d3Scale.scaleLinear().range([sizeChart.height, 0]);
		xAxis.domain(this.d3Import.d3Array.extent(data, (d) => d.x));
		yAxis.domain(this.d3Import.d3Array.extent(data.flatMap(sample => sample.yCharts), (d) => d));
		return {x: xAxis, y: yAxis};
	}

	private drawAxis(svg: any, axis: Axis, sizeChart: Size, timeRange: TimeRangeFrontend) {
		const numberTicksX = getNumberOfTicks(sizeChart.width, lookupTicksByChartWidth);
		const numberTicksY = getNumberOfTicks(sizeChart.height, lookupTicksByChartHeight);
		const tickFormatX = lookupTickFormatByRange[timeRange];
		const tickFormatY = getTickFormatForY(axis.y);

		svg.append('g')
			.attr('class', 'axis axis--x font-caption')
			.attr('transform', 'translate(0,' + sizeChart.height + ')')
			.call(this.d3Import.d3Axis.axisBottom(axis.x).ticks(numberTicksX).tickFormat(this.d3Import.d3.timeFormat(tickFormatX)));

		svg.append('g')
			.attr('class', 'axis axis--y font-caption')
			.attr('transform', `translate(${sizeChart.width},0)`)  // move to right
			.call(this.d3Import.d3Axis.axisRight(axis.y).ticks(numberTicksY).tickFormat(this.d3Import.d3.format(tickFormatY)));
	}

	private drawLines(svg: any, axis: Axis, chartData: ChartData, selectedLineIdx: number) {
		chartData.colors.forEach((color, idx) => {
			const line = this.getGeneratorLine(axis, idx);
			const chartLine = (idx === selectedLineIdx) ? 'chart-line-selected' : 'chart-line-unselected';
			svg.append('path')
				.attr('class', chartLine)
				.style('stroke', `var(${color})`)
				.attr('d', line(chartData.data));
		});
	}

	private getGeneratorLine(axis: Axis, idx: number): any {
		return this.d3Import.d3Shape.line()
			.defined(d => !isNaN(d.yCharts[idx]))
			.x((d: ChartLineSample) => axis.x(d.x))
			.y((d: ChartLineSample) => axis.y(d.yCharts[idx]));
	}

	private showNoData(): void {
		const size = getSizeHostingSvg(this.wrapperElement);
		const html = `<div class="x-center-content" style="height: ${size.height}px; width: ${size.width}px">
                    <div class="x-padding-element x-border-radius-min font-caption color-card">${this.noDataInfo}</div>
                  </div> `;
		this.createHtmlWithinElement(html, size);
	}

	private createHtmlWithinElement(html: string, size: Size): void {
		cleanAllSvgContent(this.d3Import);
		this.d3Import.d3.select('svg')
			.append('g')
			.attr('width', size.width)
			.attr('height', size.height)
			.append('foreignObject')
			.attr('width', size.width)
			.attr('height', size.height)
			.append('xhtml:body')
			.attr('width', size.width)
			.attr('height', size.height)
			.html(html);
	}
}
