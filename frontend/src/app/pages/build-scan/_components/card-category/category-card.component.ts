import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {materialIcons} from '@app/lib/global/icons';


export interface ContentCategory {
    isValid: boolean;
    info: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-category-card',
    templateUrl: './category-card.component.html',
    styleUrls: ['./category-card.component.scss']
})
export class CategoryCardComponent {
    @Input() description: string;
    @Input() content$: Observable<ContentCategory>;
    @Input() iconSideOption: string = materialIcons.copy;
    @Output() clickOnCard = new EventEmitter();
    @Output() clickOnSideOption = new EventEmitter();

    constructor() {
    }
}
