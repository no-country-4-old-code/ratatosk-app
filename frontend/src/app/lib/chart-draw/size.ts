import {ChartCoordinates, Margin, Size} from '@app/lib/chart-draw/interfaces';
import {ElementRef} from '@angular/core';


export function getComponentCoordinates(elementRef: ElementRef): ChartCoordinates {
    const domSize = elementRef.nativeElement.getBoundingClientRect();
    return {
        x: domSize.x,
        y: domSize.y
    };
}

export function getSizeChart(elementRef: ElementRef, marginChart: Margin): Size {
    const sizeSvg = getSizeHostingSvg(elementRef);
    return {
        width: sizeSvg.width - marginChart.left - marginChart.right,
        height: sizeSvg.height - marginChart.top - marginChart.bottom
    };
}

export function getSizeHostingSvg(elementRef: ElementRef): Size {
    const domSize = elementRef.nativeElement.getBoundingClientRect();
    return {
        width: domSize.width,
        height: domSize.height
    };
}
