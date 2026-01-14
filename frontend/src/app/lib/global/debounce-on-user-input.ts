export const debounceTimeInputMs = 200;
export const debounceTimeFixRace = 1;
// if multiple stream emit on exact same time, a race occurs.
// E.g. you split stream A in streams B, C and combine them later to D.
// Every time A is triggered, D is triggered twice. (other options are combine via withLatestRequested)
