import {AfterViewInit, Directive, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';

@Directive({
	selector: '[appMatBadgeExtension]'
})
export class MatBadgeExtensionDirective implements AfterViewInit, OnChanges {
	// This component is not reusable ! If used in "cdk virtual ngFor" disable caching of templates
	@Input() icon: string;
	@Input() isSelected: boolean;
	private readonly fontSizePx = 12;
	private readonly animationAppearClass = 'x-animate-appear';
	private readonly animationDisappearClass = 'x-animate-disappear';

	constructor(private el: ElementRef) {
	}

	ngAfterViewInit() {
		const badge = this.el.nativeElement.querySelector('.mat-badge-content');
		badge.style.display = 'flex';
		badge.style.alignItems = 'center';
		badge.style.justifyContent = 'center';
		badge.style.marginBottom = '10px';
		badge.style.marginRight = '5px';
		this.setVisibility(badge, this.isSelected);
		badge.innerHTML = `<i class="material-icons" style="font-size: ${this.fontSizePx}px;">${this.icon}</i>`;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.hasOwnProperty('isSelected')) {
			if (!changes.isSelected.isFirstChange()) {
				const badge = this.el.nativeElement.querySelector('.mat-badge-content');
				this.setVisibility(badge, true);
				this.runAnimation(badge, this.isSelected);
			}
		}
	}


// private

	private runAnimation(badge: Element, isSelected: boolean) {
		if (isSelected) {
			this.animateAppear(badge);
		} else {
			this.animateDisappear(badge);
		}
	}

	private animateDisappear(badge: Element): void {
		badge.classList.add(this.animationDisappearClass);
		badge.classList.remove(this.animationAppearClass);
	}

	private animateAppear(badge: Element): void {
		badge.classList.add(this.animationAppearClass);
		badge.classList.remove(this.animationDisappearClass);
	}

	private setVisibility(badge: any, isVisible: boolean): void {
		badge.style.visibility = (isVisible) ? 'visible' : 'hidden';
	}

}

