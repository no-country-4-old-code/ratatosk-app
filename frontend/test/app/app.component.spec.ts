import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from '@app/app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from 'environments/environment';
import {AngularFireModule} from '@angular/fire';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {firebaseConfigurations} from '@shared_library/settings/firebase-projects';

describe('AppComponent', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
			RouterTestingModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
	        AngularFireModule.initializeApp(firebaseConfigurations['USER_001']), AngularFireMessagingModule, HttpClientTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
