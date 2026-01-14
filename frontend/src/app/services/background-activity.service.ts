import {Injectable} from '@angular/core';
import {UpdateDaemon} from '@app/services/update-daemon.service';
import {NotificationDaemon} from '@app/services/notification-daemon.service';
import {UserActivityDaemon} from '@app/services/user-activity-daemon.service';

@Injectable({
	providedIn: 'root'
})
export class BackgroundActivityService {

	constructor(updateDaemon: UpdateDaemon, notificationDaemon: NotificationDaemon, userActivityDaemon: UserActivityDaemon) {
		/*
		This service collect all daemon web* so you only have to import this service once in your constructor.
		*/
	}
}
