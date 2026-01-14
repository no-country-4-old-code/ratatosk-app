import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, timer} from "rxjs";
import {map} from "rxjs/operators";
import {imagePaths} from "@lib/global/images";

interface CountDown {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-welcome-android',
  templateUrl: './welcome-android.component.html',
  styleUrls: ['./welcome-android.component.scss']
})
export class WelcomeAndroidComponent {
  readonly iconUrl = imagePaths.appSmall;
  readonly counter$: Observable<CountDown>;
  private readonly dateRelease = new Date("2021-10-01T00:00:00.000Z");

  constructor() {
    this.counter$ = timer(0, 1000).pipe(
        map(() => this.getDeltaToReleaseDate()),
        map((delta: Date) => {
          return {
            seconds: delta.getSeconds(),
            minutes: delta.getMinutes(),
            hours: delta.getHours(),
            days: this.getNumberOfDays(delta)
          };
        })
    );
  }

  private getDeltaToReleaseDate(): Date {
    const currentInMs = new Date().getTime();
    const relaseInMs = this.dateRelease.getTime();
    let delta = 0;
    if (currentInMs < relaseInMs) {
      delta = relaseInMs - currentInMs;
    }
    return new Date(delta);
  }

  private getNumberOfDays(date: Date): number {
    const dateInMs = date.getTime();
    const hoursInMs = date.getHours() * 60 * 60 * 1000;
    const minutesInMs = date.getMinutes() * 60 * 1000;
    const secondsInMs = date.getSeconds() * 1000;
    const remainInMs = dateInMs - hoursInMs - minutesInMs - secondsInMs;
    const remainDays = remainInMs / (24 * 60 * 60 * 1000);
    return Math.floor(remainDays);
  }
}
