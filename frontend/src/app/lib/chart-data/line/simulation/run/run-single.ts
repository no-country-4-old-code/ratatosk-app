import {TimeRange, TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {FunctionBlueprint} from '../../../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {buildIndicatorFunction} from '../../../../../../../../shared-library/src/scan/indicator-functions/build';


export function runOnSimulatedData(displayedRange: TimeRange, blueprint: FunctionBlueprint, stepsArray: TimeSteps[]): number[] {
    const func = buildIndicatorFunction(blueprint);
    return stepsArray.map(steps => {
        return run(() => func(steps));
    });
}

// private

function run(func: () => number): number {
    let result = NaN;
    try {
        result = func();
    } catch (e) {
    }
    return result;
}
