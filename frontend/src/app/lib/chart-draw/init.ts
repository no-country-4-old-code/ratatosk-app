import {Margin} from '@app/lib/chart-draw/interfaces';
import {ImportD3} from "@shared_comp/chart-line/import-d3";

export function initSvg(margin: Margin, d3Import: ImportD3, selector = 'svg'): any {
    cleanAllSvgContent(d3Import, selector);
    return d3Import.d3.select(selector)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

export function cleanAllSvgContent(d3Import: ImportD3, selector = 'svg', ) {
    d3Import.d3.select(selector).selectAll('*').remove();
}
