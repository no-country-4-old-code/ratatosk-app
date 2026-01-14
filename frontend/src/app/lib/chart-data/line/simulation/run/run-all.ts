import {runOnSimulatedData} from '@app/lib/chart-data/line/simulation/run/run-single';
import {MetricCoinHistory} from '../../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {TimeRange, TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {FunctionBlueprint} from '../../../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {createSampleStepData} from '@app/lib/chart-data/line/simulation/helper/create-sample-step-data';
import {
    lookupCompleteDurationInMinutesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../../shared-library/src/settings/sampling';
import {History} from '../../../../../../../../shared-library/src/datatypes/data';


export function applyFunctionsToSimulation(history: History<'coin'>, attr: MetricCoinHistory, displayedRange: TimeRange, blueprints: FunctionBlueprint[]): number[][] {
    const stepArray = createSimulationStepData(history, attr, displayedRange);
    return blueprints.map(blueprint => {
        return runOnSimulatedData(displayedRange, blueprint, stepArray);
    });
}

// private

function createSimulationStepData(history: History<'coin'>, attr: MetricCoinHistory, displayedRange: TimeRange): TimeSteps[] {
    const stepWidth = lookupStepWidthInMinutesOfRange[displayedRange];
    const numberOfSamples = Math.floor(lookupCompleteDurationInMinutesOfRange[displayedRange] / stepWidth);
    return createSampleStepData(history[attr], numberOfSamples, stepWidth);
}
