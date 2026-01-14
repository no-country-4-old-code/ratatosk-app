export function disableConsoleLog(): void {
    spyOn(console, 'log');
    spyOn(console, 'warn');
    spyOn(console, 'error');
}
