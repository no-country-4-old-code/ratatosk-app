import {ElementRef} from '@angular/core';
import {ChartData, ChartLineSample} from '@app/lib/chart-data/interfaces';
import {marginChartLine} from '@shared_comp/chart-line/chart-margin';
import {Axis, ChartCoordinates, Size} from '@app/lib/chart-draw/interfaces';
import {getComponentCoordinates, getSizeChart} from '@app/lib/chart-draw/size';
import {getTickFormatForY} from '@app/lib/chart-draw/ticks';
import {lookupCurrencySymbol} from '@app/lib/coin/currency/unit';
import {ImportD3} from "@shared_comp/chart-line/import-d3";

type PositionRelativeToLine = 'left' | 'right';


export class ChartTooltip {
	private tooltipLine: any;
	private tooltipInfoCard: any;
	private tooltipInfoCardValues: any;
	private tooltipDots: any[];
	private readonly sizeChart: Size;
	private readonly axis: Axis;
	private readonly data: ChartLineSample[];
	private readonly unit: string;
	private readonly componentCoordinates: ChartCoordinates;
	private readonly radiusDot = 4;
	private readonly paddingInfoCard = 16;
	private readonly opacityNormal = 0.75;
	private readonly colors: string[];
	private cardPositionRelativeToLine: PositionRelativeToLine = 'right';


	constructor(svg: any, elementRef: ElementRef, axis: Axis, chartData: ChartData, private d3Import: ImportD3) {
		this.sizeChart = getSizeChart(elementRef, marginChartLine);
		this.axis = axis;
		this.data = chartData.data;
		this.componentCoordinates = getComponentCoordinates(elementRef);
		this.colors = chartData.colors;
		this.unit = lookupCurrencySymbol[chartData.unit];
		this.initTooltips(this.sizeChart, svg, this.data);
	}

	public makeTooltipsInvisible() {
		this.changeVisibility(this.tooltipLine, 0);
		this.changeVisibility(this.tooltipInfoCard, 0);
		this.tooltipDots.forEach(dot => this.changeVisibility(dot, 0));
	}

	public makeTooltipsVisible() {
		const opacityLine = 0.25;
		this.changeVisibility(this.tooltipLine, opacityLine);
		this.changeVisibility(this.tooltipInfoCard, this.opacityNormal);
		// Normally Visibility of dots are handled in "update" to manage NaN-Values
		this.tooltipDots.forEach( dot => this.changeVisibility(dot, this.opacityNormal));
	}

	public updateTooltips(event) {
		const coordinateX = this.getRelativePositionX(event, this.componentCoordinates);
		const {currentDate, idx} = this.getDataIndex(this.axis, coordinateX, this.data);

		if (this.isValidTooltipPosition(idx, coordinateX)) {
			const correctedValuesY = this.data[0].yCharts.map((notUsed, idxValue) =>
				this.getValueY(this.data, this.axis, coordinateX, idx, idxValue));
			this.moveTooltip(coordinateX, correctedValuesY);
			this.updateTooltipInfoCardContent(this.axis, currentDate, correctedValuesY, this.tooltipInfoCardValues);
		}
	}

	public updateTooltipsByTouch(touchEvent) {
		const fakeMouseEvent = {
			pageX: touchEvent.touches[0].clientX
		};
		this.updateTooltips(fakeMouseEvent);
	}


// ----------- private


	private initTooltips(sizeChart: Size, svg, data: ChartLineSample[]) {
		this.tooltipLine = this.initTooltipLine(sizeChart, svg);
		const {selectorInfoCard, selectorInfoCardValues} = this.initTooltipInfoCard(sizeChart, data, svg);
		this.tooltipInfoCard = selectorInfoCard;
		this.tooltipInfoCardValues = selectorInfoCardValues;
		this.tooltipDots = this.initTooltipDots(svg, this.radiusDot, this.colors);
		this.makeTooltipsInvisible();
	}

	private moveTooltip(coordinateX: number, valuesY: number[]) {
		this.moveTooltipLine(this.tooltipLine, coordinateX);
		this.moveTooltipInfoCard(this.tooltipInfoCard, coordinateX);
		this.tooltipDots.forEach((dot, idx) => this.moveTooltipDot(valuesY[idx], this.axis, dot, coordinateX));
	}

	private getDataIndex(axis: Axis, coordinateX: number, data: ChartLineSample[]) {
		const x0 = axis.x.invert(coordinateX);
		const bisectLeftFunc = this.d3Import.d3.bisector(function (chartData: ChartLineSample) {
			return chartData.x;
		}).left;
		const idx: number = bisectLeftFunc(data, x0);
		return {currentDate: x0, idx};
	}

	private getRelativePositionX(event, componentCoordinates: ChartCoordinates) {
		return event.pageX - marginChartLine.left - componentCoordinates.x;
	}

	private getOffsetInfoCard(sizeInfoBox: Size, positionRelativeToLine: PositionRelativeToLine): number {
		let offset = this.paddingInfoCard;
		if (positionRelativeToLine === 'left') {
			offset = -(sizeInfoBox.width + this.paddingInfoCard);
		}
		return offset;
	}

	private getTooltipFloatDirection(positionRelativeToLine: PositionRelativeToLine): PositionRelativeToLine {
		let direction: PositionRelativeToLine = 'right';
		if (positionRelativeToLine === direction) {
			direction = 'left';
		}
		return direction;
	}

	private getCardPositionRelativeToLine(sizeChart: Size, old: PositionRelativeToLine, coordinateX: number): PositionRelativeToLine {
		const breakpointRight = sizeChart.width * 0.65;
		const breakpointLeft = sizeChart.width * 0.40;
		let position = old;

		if (coordinateX < breakpointLeft) {
			position = 'right';
		} else if (coordinateX > breakpointRight) {
			position = 'left';
		}
		return position;
	}

	private getValueY(data: ChartLineSample[], axis: Axis, coordinateX: number, idxDataset: number, idxValue: number) {
		let valueY = data[idxDataset].yCharts[idxValue];
		if (idxDataset > 0) {
			valueY = this.calcValueByInterpolation(data, axis, coordinateX, idxDataset, idxValue);
		}
		return valueY;
	}

	private updateTooltipInfoCardContent(axis: Axis, currentData: Date, correctedValuesY: number[], infoValueBox: any) {
		const tickFormatY = getTickFormatForY(axis.y);
		const dateFormatted = this.d3Import.d3.timeFormat('%d %b %y, %H:%M')(currentData);
		const formattedData = correctedValuesY.map(value => this.createDisplayedValueString(value, tickFormatY));
		const infoCardFloat = this.getTooltipFloatDirection(this.cardPositionRelativeToLine);
		const divs = formattedData.map((value, idx) => `
        <div class="flex-row">
            <span class="tooltip-card-color-box x-border-radius-min" style="border: 1px solid var(${this.colors[idx]})"></span>
            <span>${value}</span>
        </div>
    `);

		infoValueBox.html(
			`
            <div class="color-background tooltip-card font-caption x-border-radius-min tooltip-card-text" style="float: ${infoCardFloat}">
               <div class="flex-row x-div-list-title">
                <span class="tooltip-card-color-box"></span>
                <span class="tooltip-card-date">${dateFormatted}</span>
               </div>
               <div class="x-div-list">
                  ${divs.join('')}
                </div>
            </div>
            `);
	}

	private createDisplayedValueString(value: number, tickFormatY: string): string {
		let displayedValueString = this.unit + this.d3Import.d3.format(tickFormatY)(this.roundValueForDisplay(value));
		if (isNaN(value)) {
			displayedValueString = 'NaN';
		}
		return displayedValueString;
	}

	private roundValueForDisplay(value: number): number {
		const roundFunc = (divider) => Math.round(value * divider) / divider;
		if (value > 10000) {
			roundFunc(1);
		} else if (value > 100) {
			roundFunc(100);
		} else if (value > 1) {
			roundFunc(1000);
		}
		return Math.round(value * 100) / 100;
	}

	private isValidTooltipPosition(idx: number, coordinateX: number) {
		return this.data[idx] !== undefined && coordinateX >= 0;
	}

	private moveTooltipLine(selectorLine: any, coordinateX: number) {
		selectorLine.attr('transform', `translate( ${coordinateX}  ,0)`);
	}

	private moveTooltipInfoCard(infoValueGroup: any, coordinateX: number) {
		const sizeInfoBox = this.getSizeOfInfoBox(this.sizeChart);
		this.cardPositionRelativeToLine = this.getCardPositionRelativeToLine(this.sizeChart, this.cardPositionRelativeToLine, coordinateX);
		const offset = this.getOffsetInfoCard(sizeInfoBox, this.cardPositionRelativeToLine);
		infoValueGroup.attr('transform', `translate( ${coordinateX + offset}  , ${this.paddingInfoCard})`);
	}

	private moveTooltipDot(valueY: number, axis: Axis, dot: any, coordinateX: number) {
		const positionY = axis.y(valueY) - this.radiusDot;
		if (!isNaN(positionY)) {
			this.changeVisibility(dot, this.opacityNormal);
			dot.attr('transform', `translate( ${coordinateX - this.radiusDot}, ${positionY})`);
		} else {
			this.changeVisibility(dot, 0);
		}
	}

	private calcValueByInterpolation(data: ChartLineSample[], axis: Axis, coordinateX: number, idx: number, idxValue: number) {
		const valueStart = data[idx - 1].yCharts[idxValue];
		const valueEnd = data[idx].yCharts[idxValue];
		const coordStart = axis.x(data[idx - 1].x);
		const coordEnd = axis.x(data[idx].x);
		const interpolate = this.d3Import.d3.scaleLinear()
			.domain([valueStart, valueEnd])
			.range([coordStart, coordEnd]);

		return interpolate.invert(coordinateX);
	}

	private changeVisibility(selection: any, opacity: number, duration = 300) {
		selection.transition()
			.duration(duration)
			.attr('opacity', opacity);
	}

	private initTooltipDots(svg, radius: number, colors: string[]): any[] {
		const diameter = 2 * radius;
		return colors.map(color => {
			const dot = svg.append('g')
				.attr('width', diameter)
				.attr('height', diameter);
			dot.append('foreignObject')
				.attr('width', diameter)
				.attr('height', diameter)
				.append('xhtml:body')
				.attr('width', diameter)
				.attr('height', diameter)
				.style('background-color', `var(${color})`)
				.attr('class', 'tooltip-dot')
				.html('<div>.</div>');
			return dot;
		});
	}

	private initTooltipInfoCard(sizeChart: Size, data: ChartLineSample[], svg) {
		const sizeInfoBox = this.getSizeOfInfoBox(sizeChart);
		const infoValueGroup = svg.append('g').attr('opacity', 0);
		const infoValueBox = infoValueGroup.append('foreignObject')
			.attr('width', sizeInfoBox.width)
			.attr('height', sizeInfoBox.height)
			.append('xhtml:body')
			.html(' '); //  .attr('class', 'tooltip-card font-caption x-border-radius-min')
		return {sizeInfoBox, selectorInfoCard: infoValueGroup, selectorInfoCardValues: infoValueBox};
	}

	private initTooltipLine(sizeChart: Size, svg) {
		const line = this.d3Import.d3.path();
		line.moveTo(0, 0);
		line.lineTo(0, sizeChart.height);
		line.closePath();

		const tooltipLine = svg.append('path')
			.attr('d', line)
			.attr('class', 'tooltip-line');
		return tooltipLine;
	}

	private getSizeOfInfoBox(chartSize: Size): Size {
		const minHeight = 77; // min height to see at least two signals
		const height = Math.max(minHeight, chartSize.height / 2);
		return {
			width: chartSize.width / 2,
			height
		};
	}
}
