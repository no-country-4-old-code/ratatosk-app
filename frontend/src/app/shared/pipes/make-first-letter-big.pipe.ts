import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'makeFirstLetterBig'})

export class MakeFirstLetterBigPipe implements PipeTransform {
	transform(value: string) {
		const firstLetter = value.charAt(0);
		return firstLetter.toUpperCase() + value.slice(1);
	}
}
