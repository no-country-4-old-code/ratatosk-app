import {By} from '@angular/platform-browser';
import {tick} from '@angular/core/testing';

let fixture;

export function initTestUtils (newFixture) {
  fixture = newFixture;
}


export function getElement (cssSelector: string) {
  throwErrorIfFixtureIsNotSet();
  return fixture.debugElement.query(By.css(cssSelector));
}

export function getElements (cssSelector: string) {
  throwErrorIfFixtureIsNotSet();
  return fixture.debugElement.queryAll(By.css(cssSelector));
}

export function getNumberOf (cssSelector: string) {
  return getElements(cssSelector).length;
}

export function waitTicks(ms = 100) {
  throwErrorIfFixtureIsNotSet();
  fixture.detectChanges();
  tick(ms);
  fixture.detectChanges();
}

function throwErrorIfFixtureIsNotSet() {
  if (fixture === undefined) {
    throw new Error('TestUtils: fixture was not set but it is used by this function. Not runnable without TestBed');
  }
}
