/**
 * Determines if the provided value adheres to the AsyncIterable protocol.
 *
 * @param arg Any value
 */
export function isAsyncIterable<T>(arg: any): arg is AsyncIterable<T> {
    return Boolean(arg) && typeof arg[Symbol.asyncIterator] === 'function';
}

/**
 * Determines if the provided value adheres to Iterable protocol.
 *
 * @param arg Any value
 */
export function isSyncIterable<T>(arg: any): arg is Iterable<T> {
    return Boolean(arg) && typeof arg[Symbol.iterator] === 'function';
}
