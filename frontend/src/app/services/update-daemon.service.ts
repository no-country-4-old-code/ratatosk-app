import {Injectable, OnDestroy} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {Subscription} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UpdateDaemon implements OnDestroy {
	/* This service is a daemon. It makes it's own subscriptions, runs in the background and have no public interface.
	 * Daemons are bad ! Try to avoid them.
	 * The only service which is allowed to import a daemon-service is "background-activity"
	 */
	private readonly subscription: Subscription;

	constructor(private update: SwUpdate) {
		this.subscription = this.onUpdate(this.handleOnUpdate);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	private handleOnUpdate(): void {
		console.log('HARHAR-- Update Time');
	}

	private onUpdate(callback: () => void): Subscription {
		return this.update.available.subscribe(_ => this.update.activateUpdate().then(() => {
			console.log('reload for update');
			callback();
			document.location.reload();
		}));
	}
}
