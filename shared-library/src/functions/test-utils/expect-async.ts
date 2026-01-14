export async function haveAsyncFunctionThrownError(func: () => Promise<any>): Promise<boolean> {
    try {
        await func();
        return false;
    } catch {
        return true;
    }
}