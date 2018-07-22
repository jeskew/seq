import { isAsyncIterable } from './isIterable';

/**
 * Extracts the underlying synchronous or asynchronous iterator from a
 * synchronous or asynchronous iterable, respectively.
 *
 * If the provided value adheres to both the Iterable and AsyncIterable
 * protocols, its asynchronous interface will be used.
 *
 * @param iterable A synchronous or asynchronous iterable.
 */
export function iteratorFromIterable<T>(
    iterable: Iterable<T>|AsyncIterable<T>
): Iterator<T>|AsyncIterator<T> {
    if (isAsyncIterable(iterable)) {
        return iterable[Symbol.asyncIterator]();
    }

    return iterable[Symbol.iterator]();
}
