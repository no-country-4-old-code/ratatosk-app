import {Pipe, PipeTransform} from '@angular/core';
import {formatCurrency} from '@angular/common';

@Pipe({
	name: 'currencyCoinShorted'
})
export class CurrencyCoinShortedPipe implements PipeTransform {

	transform(value: number, currencySymbol: string): string | null {
		const locale = 'en-US';
		const digitsInfo = '1.2-2';
		const basis = 1000;
		const borderValue = 10;
		let ret = '--';

		if (!isNaN(value)) {
			const exponent = this.getExponent(value, basis, borderValue);
			const suffix = this.getSuffix(exponent);
			const newValue = this.shrinkValue(value, exponent, basis);
			const currencyStr = formatCurrency(newValue, locale, currencySymbol, currencySymbol, digitsInfo);
			ret = currencyStr + suffix;
		}
		return ret;
	}

	private getExponent(value: number, basis: number, borderValue?: number): number {
		if (borderValue === undefined) {
			borderValue = 1; // border for biggest displayed number is: borderValue * Math.pow(basis, exponent + 1)
		}
		let rest = Math.abs(value);
		let exponent = -1;
		do {
			exponent += 1;
			rest = rest / basis;
		} while (rest >= borderValue);
		return exponent;
	}

	private getSuffix(exponent: number): string {
		const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qu'];
		return suffixes[exponent];
	}

	private shrinkValue(value: number, exponent: number, basis: number): number {
		return value / Math.pow(basis, exponent);
	}
}

