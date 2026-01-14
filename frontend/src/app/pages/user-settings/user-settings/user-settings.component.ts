import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {Observable} from 'rxjs';
import {
    DialogSelectOneComponent,
    DialogSelectOneData
} from '@shared_comp/dialog-select-one/dialog-select-one.component';
import {dialogWidth, updateOnDialogClose} from '@app/lib/util/dialog';
import {MatDialog} from '@angular/material/dialog';
import {distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {UserService} from '@app/services/user.service';
import {Currency} from '../../../../../../shared-library/src/datatypes/currency';
import {getCurrencies} from '../../../../../../shared-library/src/functions/currency';
import {UserSettings} from '../../../../../../shared-library/src/datatypes/user';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
	readonly title = 'settings';
	readonly iconBack = materialIcons.back;
	readonly currency$: Observable<Currency>;
	private readonly settings$: Observable<UserSettings>;

	constructor(private dialog: MatDialog, private user: UserService) {
		this.settings$ = this.getSettings$();
		this.currency$ = this.getCurrency$(this.settings$);
	}

	openDialogCurrency(selected: Currency) {
		const options: Currency[] = getCurrencies();
		const optionsInfo = this.getOptionInfoCoin(options);
		const optionsUpperCase = options.map(opt => opt.toUpperCase());
		const data: DialogSelectOneData = {options: optionsUpperCase, selected, optionsInfo, title: this.title};
		const dialogRef = this.dialog.open(DialogSelectOneComponent, {width: dialogWidth, data});
		updateOnDialogClose(dialogRef, (resultUpperCase: any) => {
			const result = resultUpperCase.toLowerCase();
			if (result !== selected && result !== undefined) {
				this.saveChanges({currency: result});
			}
		});
	}

	// private

	private getSettings$(): Observable<UserSettings> {
		return this.user.user$.pipe(
			map(user => user.settings)
		);
	}

	private getCurrency$(settings$: Observable<UserSettings>): Observable<Currency> {
		const initUnit: Currency = 'usd';
		return settings$.pipe(
			map(settings => settings.currency),
			startWith(initUnit),
			distinctUntilChanged(),
		);
	}

	private saveChanges(changes: Partial<UserSettings>) {
		const save$ = this.settings$.pipe(
			onlyFirstEmitWillPass(),
			map(settings => ({...settings, ...changes})),
			switchMap(settings => this.user.updateUserData({settings})),
		);
		save$.subscribe();
	}


	private getOptionInfoCoin(options: Currency[]): string[] {
		const lookupInfo: { [unit in Currency]: string } = {
			'usd': 'US Dollar',
			'aed': 'Emirati Dirham',
			'aud': 'Australian Dollar',
			'bdt': 'Bangladeshi Taka',
			'brl': 'Brazilian Real',
			'cad': 'Canadian Dollars',
			'chf': 'Swiss Franc',
			'clp': 'Chilean Peso',
			'cny': 'Chinese Yuan',
			'czk': 'Czech Koruna',
			'dkk': 'Danish Krone',
			'eur': 'Euro',
			'gbp': 'Pounds Sterling',
			'hkd': 'Hong Kong Dollar',
			'idr': 'Indonesian Rupiah',
			'ils': 'Israeli Shekel',
			'inr': 'Indian Rupee',
			'jpy': 'Japanese Yen',
			'krw': 'South Korean Won',
			'lkr': 'Sri Lankan Rupee',
			'mxn': 'Mexican Peso',
			'myr': 'Malaysian Ringgit',
			'ngn': 'Nigerian Naira',
			'nok': 'Norwegian Krone',
			'nzd': 'New Zealand Dollar',
			'php': 'Philippine Peso',
			'pkr': 'Pakistani Rupee',
			'pln': 'Polish Zloty',
			'rub': 'Russian Ruble',
			'sek': 'Swedish Krona',
			'sgd': 'Singapore Dollar',
			'thb': 'Thai Baht',
			'try': 'Turkish Lira',
			'uah': 'Ukrainian Hryvna',
			'vnd': 'Vietnamese Dong',
			'zar': 'South african Rand',
		};
		return options.map(unit => `Set default currency to ${lookupInfo[unit]}`);
	}
}
