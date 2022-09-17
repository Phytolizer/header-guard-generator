export function findLastIndex<T>(
    a: T[],
    predicate: (value: T) => boolean
): number | undefined {
    for (let i = a.length - 1; i >= 0; i--) {
        if (predicate(a[i])) {
            return i;
        }
    }
    return undefined;
}