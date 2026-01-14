export function mapToPromise<T>(result: T): Promise<T> {
    return new Promise<T>((resolve) => resolve(result));
}