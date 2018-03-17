import { isSyncIterable } from './isIterable';

/**
 * Determines if any value yielded by the provided iterable satisfies the
 * provided predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean.
 */
export async function some<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    if (isSyncIterable(iterable)) {
        return someSync(predicate, iterable);
    }

    for (
        let iterator = iterable[Symbol.asyncIterator](),
            next = await iterator.next(),
            element = next.value,
            done = next.done;
        !done;
        next = await iterator.next(),
        element = next.value,
        done = next.done
    ) {
        if (predicate(element)) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }

            return true;
        }
    }

    return false;
}

export function someSync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
) {
    for (const element of iterable) {
        if (predicate(element)) {
            return true;
        }
    }

    return false;
}
