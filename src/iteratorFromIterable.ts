function isAsyncIterable<T>(arg: any): arg is AsyncIterable<T> {
    return Boolean(arg) && typeof arg[Symbol.asyncIterator] === 'function';
}

export function iteratorFromIterable<T>(
    iterable?: Iterable<T>|AsyncIterable<T>
): Iterator<T>|AsyncIterator<T> {
    if (isAsyncIterable(iterable)) {
        return iterable[Symbol.asyncIterator]();
    }

    return (iterable as Iterable<T>)[Symbol.iterator]();
}
