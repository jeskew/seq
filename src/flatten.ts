import { isIterable } from './isIterable';

/**
 * A synchronous iterable whose elements are either of type T or are themselves
 * synchronous or asynchronous iterables of an arbitrary depth.
 */
export interface RecursiveSyncIterable<T> extends
    Iterable<T|RecursiveIterable<T>>
{}

/**
 * An asynchronous iterable whose elements are either of type T or are
 * themselves synchronous or asynchronous iterables of an arbitrary depth.
 */
export interface RecursiveAsyncIterable<T> extends
    AsyncIterable<T|RecursiveIterable<T>>
{}

/**
 * A synchronous or asynchronous iterable whose elements are either of type T or
 * are themselves synchronous or asynchronous iterables of an arbitrary depth.
 */
export type RecursiveIterable<T> = RecursiveSyncIterable<T>|RecursiveAsyncIterable<T>;

/**
 * An element yielded by an iterable that may or may not be iterable itself.
 */
export type ElementOrIterable<T> = T|Iterable<T>|AsyncIterable<T>;

/**
 * Flattens an iterable that yields elements of type T or
 * Iterable<T>|AsyncIterable<T> into an interable that yields elements of type
 * T.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param iterable The iterable to flatten
 */
export function flatten<T>(
    iterable: Iterable<ElementOrIterable<T>>|AsyncIterable<ElementOrIterable<T>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to `depth` times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable. Specify `Infinity` to flatten the
 *                  iterable until it contains only non-iterable elements.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: number,
    iterable: RecursiveIterable<T>
): AsyncIterableIterator<T|RecursiveIterable<T>>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 0,
    iterable: Iterable<T>|AsyncIterable<T>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to one time.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 1,
    iterable: Iterable<ElementOrIterable<T>>|AsyncIterable<ElementOrIterable<T>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to two times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 2,
    iterable: Iterable<ElementOrIterable<ElementOrIterable<T>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<T>>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to three times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 3,
    iterable: Iterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to four times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 4,
    iterable: Iterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to five times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 5,
    iterable: Iterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>>>
): AsyncIterableIterator<T>;

export function flatten<T>(
    depthOrIterable: number|RecursiveIterable<T>,
    iterable?: RecursiveIterable<T>
) {
    let depth: number;
    if (typeof depthOrIterable === 'number') {
        depth = depthOrIterable;
    } else {
        depth = 1;
        iterable = depthOrIterable;
    }

    return flattenIntoIterable(depth, iterable as RecursiveIterable<T>);
}

async function *flattenIntoIterable<T>(
    depth: number,
    iterable: RecursiveIterable<T>
): AsyncIterableIterator<T|RecursiveIterable<T>> {
    for await (const element of iterable) {
        if (typeof element !== 'string' && isIterable(element) && depth > 0) {
            yield* flattenIntoIterable(depth - 1, element);
        } else {
            yield element;
        }
    }
}
