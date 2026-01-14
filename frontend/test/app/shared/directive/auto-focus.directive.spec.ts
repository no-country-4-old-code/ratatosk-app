import {AutoFocusDirective} from '@app/shared/directive/auto-focus.directive';

describe('AutoFocusDirective', () => {
    const mockElementRef = jasmine.createSpyObj('ElementRef', ['focus']);

    it('should create an instance', () => {
        const directive = new AutoFocusDirective(mockElementRef);
        expect(directive).toBeTruthy();
    });
});
