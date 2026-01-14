import {ScanFrontend} from '@app/lib/scan/interfaces';
import {maxLengthTitle, maxNumberOfConditions} from '../../../../../shared-library/src/scan/settings';
import {mapPreselection2Ids} from '@shared_library/functions/map-preselection-2-ids';

export type BuildCategory = 'Icon' | 'Title' | 'Preselection' | 'Conditions' | 'Notification';

export interface BuildError {
    category: BuildCategory;
    msg: string;
}

type Check = (view: ScanFrontend) => BuildError;

const emptyMsg = '';

const checks: Check[] = [
    checkIfTitleEmpty,
    checkIfTitleToLong,
    checkIfNoCoinsPreSelected,
    checkIfNumberOfConditionsTooBig
];

export function runPlausibilityChecks(view: ScanFrontend): BuildError[] {
    return checks.map(check => check(view)).filter(buildError => buildError.msg !== emptyMsg);
}

// private

function checkIfTitleEmpty(view: ScanFrontend): BuildError {
    let msg = emptyMsg;
    if (view.title.length === 0) {
        msg = 'Please enter a valid name';
    }
    return {category: 'Title', msg};
}

function checkIfTitleToLong(view: ScanFrontend): BuildError {
    let msg = emptyMsg;
    if (view.title.length > maxLengthTitle) {
        msg = `Please shorten the name.\nIt exceeds the maximum number of chars by ${view.title.length - maxLengthTitle} char(s).`;
    }
    return {category: 'Title', msg};
}

function checkIfNoCoinsPreSelected(view: ScanFrontend): BuildError {
    const ids = mapPreselection2Ids(view.preSelection, view.asset);
    let msg = emptyMsg;
    if (ids.length === 0) {
        msg = 'Please (pre)-select at least one coin.';
    }
    return {category: 'Preselection', msg};
}

function checkIfNumberOfConditionsTooBig(view: ScanFrontend): BuildError {
    let msg = emptyMsg;
    if (view.conditions.length > maxNumberOfConditions) {
        msg = `Please reduce the number of conditions.\n The maximum number of conditions per scan is exceeded by ${view.conditions.length - maxNumberOfConditions} condition(s).`;
    }
    return {category: 'Conditions', msg};
}
