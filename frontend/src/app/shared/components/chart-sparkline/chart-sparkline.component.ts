import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {combineLatest, from, Observable} from 'rxjs';
import {ChartSparkSample, ColorChartSparkline} from '@app/lib/chart-data/interfaces';
import {ChartMixin} from '@app/lib/components/mixin-chart';
import {getSizeChart, getSizeHostingSvg} from '@app/lib/chart-draw/size';
import {cleanAllSvgContent, initSvg} from '@app/lib/chart-draw/init';
import {Axis, Margin, Size} from '@app/lib/chart-draw/interfaces';
import {importD3, ImportD3} from "@shared_comp/chart-line/import-d3";

@Component({
  selector: 'app-chart-sparkline',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './chart-sparkline.component.html',
  styleUrls: ['./chart-sparkline.component.scss']
})
export class ChartSparklineComponent extends ChartMixin implements AfterViewInit, OnDestroy {
  @Input() samples$: Observable<ChartSparkSample[] | undefined>;
  @Input() color$: Observable<ColorChartSparkline>;
  @ViewChild('chart') private wrapperElement: ElementRef;
  private readonly marginChartSpark: Margin = {top: 0, bottom: 0, right: 0, left: 0};
  private d3Import: ImportD3;

  ngAfterViewInit() {
    const trigger$ = this.subjectExternalReDrawTrigger.asObservable();
    const importD3$ = from(importD3());

    combineLatest(trigger$, this.samples$, this.color$, importD3$).pipe(
        this.takeUntilDestroyed()
    ).subscribe(([trigger, samples, color, importedD3]) => {
      this.d3Import = importedD3;
      this.initChart(samples, color);
    });
  }

  private initChart(samples: ChartSparkSample[], color: ColorChartSparkline) {
    if (samples !== undefined && samples.length > 0) {
      this.createChart(samples, color);
    } else {
      this.showNoData();
    }
  }

  private createChart(samples: ChartSparkSample[], color: ColorChartSparkline): void {
    const svg = initSvg(this.marginChartSpark, this.d3Import, this.wrapperElement.nativeElement);
    const sizeChart = getSizeChart(this.wrapperElement, this.marginChartSpark);
    const axis = this.initAxis(sizeChart, samples);
    this.drawLines(svg, axis, samples, color);
  }

  private initAxis(sizeChart: Size, data: ChartSparkSample[]): Axis {
    const xAxis = this.d3Import.d3Scale.scaleLinear().range([0, sizeChart.width]);
    const yAxis = this.d3Import.d3Scale.scaleLinear().range([sizeChart.height, 0]);
    xAxis.domain(this.d3Import.d3Array.extent(data, (d, i) => i));
    yAxis.domain(this.d3Import.d3Array.extent(data, (d) => d));
    return {x: xAxis, y: yAxis};
  }

  private drawLines(svg: any, axis: Axis, samples: ChartSparkSample[], color: ColorChartSparkline) {
    const line = this.getGeneratorLine(axis, 0);
    const chartLine = 'chart-line';
    svg.append('path')
        .attr('class', chartLine)
        .style('stroke', `var(${color})`)
        .attr('d', line(samples));
  }

  private getGeneratorLine(axis: Axis, idx: number): any {
    return this.d3Import.d3Shape.line()
        .defined(d => !isNaN(d))
        .x((d, i) => axis.x(i))
        .y((d: ChartSparkSample) => axis.y(d)); //.x((d: ChartSparkSample) => axis.x(d.x))
  }

  private showNoData(): void {
    const size = getSizeHostingSvg(this.wrapperElement);
    const html = `<div class="x-center-content" style="height: ${size.height}px; width: ${size.width}px">
                    <div class="x-padding-element x-border-radius-min color-card">No data selected</div>
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
