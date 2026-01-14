import {CompareOption} from './interfaces';

export function mapCompare2Beautiful(compare: CompareOption): string {
    return `should be <b>${compare}</b> than`;
}