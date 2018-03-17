import { isSyncIterable } from './isIterable';

/**
 * Locates the first value yielded by the supplied iterable that satisfies the
 * supplied predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export function find<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
): T;

export function find<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
): Promise<T>;

export function find<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): T|Promise<T>;

export function find<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): T|Promise<T> {
    if (isSyncIterable(iterable)) {
        return findSync(predicate, iterable);
    }

    return findAsync(predicate, iterable);
}

export function findSync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
): T {
    for (const element of iterable) {
        if (predicate(element)) {
            return element;
        }
    }

    throw new Error('No yielded value satisfied the provided condition');
}

async function findAsync<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
): Promise<T> {
    const iterator = iterable[Symbol.asyncIterator]();
    for (
        let next = await iterator.next(),
            value = next.value,
            done = next.done;
        !done;
        next = await iterator.next(),
        value = next.value,
        done = next.done
    ) {
        if (predicate(value)) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
            return value;
        }
    }

    throw new Error('No yielded value satisfied the provided condition');
}
