import {Pipe, PipeTransform} from '@angular/core';
import {formatCurrency} from '@angular/common';

@Pipe({
	name: 'currencyCoin'
})
export class CurrencyCoinPipe implements PipeTransform {

	transform(value: number, currencySymbol: string): string | null {
		const locale = 'en-US';
		let ret = '--';
		let digitsInfo = '1.2-2';

		if (value < 1) {
			digitsInfo = '1.2-8';
		}

		if (!isNaN(value)) {
			ret = formatCurrency(value, locale, currencySymbol, currencySymbol, digitsInfo);
		}
		return ret;
	}
}
