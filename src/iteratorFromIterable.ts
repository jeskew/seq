import { isAsyncIterable } from './isIterable';

export function iteratorFromIterable<T>(
    iterable?: Iterable<T>|AsyncIterable<T>
): Iterator<T>|AsyncIterator<T> {
    if (isAsyncIterable(iterable)) {
        return iterable[Symbol.asyncIterator]();
    }

    return (iterable as Iterable<T>)[Symbol.iterator]();
}
