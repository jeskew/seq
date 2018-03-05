export function isAsyncIterable<T>(arg: any): arg is AsyncIterable<T> {
    return Boolean(arg) && typeof arg[Symbol.asyncIterator] === 'function';
}

export function isIterable<T>(arg: any): arg is Iterable<T>|AsyncIterable<T> {
    return isAsyncIterable(arg) || isSyncIterable(arg);
}

export function isSyncIterable<T>(arg: any): arg is Iterable<T> {
    return Boolean(arg) && typeof arg[Symbol.iterator] === 'function';
}
