import {Scan} from '../scan/interfaces';
import {Currency} from './currency';
import firestore from 'firebase/app';
import 'firebase/firestore';

export interface UserData {
    settings: UserSettings;
    pro: UserProStatus;
    feedback?: number;
    scans: Scan[];
    pushIds: string[];
    lastUserActivity: firestore.firestore.FieldValue | Timestamp;
}

export interface UserSettings {
    currency: Currency;
}

export interface UserProStatus {
    hasCanceledProVersion: boolean;
    useProVersionUntil: number; // filled with Date.now() (UNIX time -> ms since 1970)
}

export interface Timestamp {
    seconds: number;
    nanoseconds: number;
}