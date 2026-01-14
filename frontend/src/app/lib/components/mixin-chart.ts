import {BehaviorSubject} from 'rxjs';
import {OnDestroyMixin} from '@app/lib/components/mixin-on-destroy';


export abstract class ChartMixin extends OnDestroyMixin {
    protected readonly subjectExternalReDrawTrigger = new BehaviorSubject<boolean>(true);

    onResize() {
        this.subjectExternalReDrawTrigger.next(true);
    }

}
