export type ParamOptionBasic = 'factor'
export type ParamOption = 'scope' | 'threshold' | 'weight' | ParamOptionBasic

type ScopeOf1D = 60 | 120 | 180 | 240 | 300 | 360 | 720 | 1440   // 1h, 2h, 3h, 4h, 5h, 6h, 12h, 24h
type ScopeOf1W = 2880 | 4320 | 5760 | 7200 | 8640 | 10080   // 2D, 3D, 4D, 5D, 6D, 7D
type ScopeOf3M = 20160 | 30240 | 40320 | 80640 | 120960 // 2W, 3W, 4W, 8W, 12W
type ScopeOfOther = 302400 | 423360 | 524160 | 1048320  // 30W, 42W, 52W, 104W
export type ScopeInMin = ScopeOf1D | ScopeOf1W | ScopeOf3M | ScopeOfOther


export interface Params {
    factor?: number;
    scope?: ScopeInMin;
    threshold?: number;
    weight?: number;
}
