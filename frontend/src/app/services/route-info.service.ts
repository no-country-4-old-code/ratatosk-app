import {Injectable} from '@angular/core';
import {Location} from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class RouteInfoService {
	readonly initUrl = '';
	previousUrl = this.initUrl;

	constructor(private location: Location) {
		// TODO: rmv this service as soon as other options$ for getting previous url
		const callback = this.buildUrlChangeFunc();
		location.onUrlChange(url => callback(url));
	}

	private buildUrlChangeFunc(): (url: string) => void {
		const buffer: string[] = [];
		let lastUrl = this.initUrl;
		return (url: string) => {
			if (url !== lastUrl) {
				this.setPreviousUrl(buffer, url);
			}
			lastUrl = url;
		};
	}

	private setPreviousUrl(buffer: string[], url: string) {
		buffer.unshift(url);
		if (buffer.length > 1) {
			this.previousUrl = buffer.pop();
		}
	}
}
