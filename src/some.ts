import { iteratorFromIterable } from './iteratorFromIterable';

/**
 * Determines if any value yielded by the provided iterable satisfies the
 * provided predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function some<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    for (
        let iterator = iteratorFromIterable(iterable),
            next = await iterator.next(),
            element = next.value,
            done = next.done;
        !done;
        next = await iterator.next(),
        element = next.value,
        done = next.done
    ) {
        if (await predicate(element)) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }

            return true;
        }
    }

    return false;
}
