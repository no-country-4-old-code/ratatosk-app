import {isPublicRelease} from '../settings/firebase-projects';

export function cleanInPublicRelease(str: string): string {
    /*
     * Some response messages from the server are helpful for debugging but should not be displayed in public.
     */
    if ( isPublicRelease ) {
        return '';
    } else {
        return str;
    }
}