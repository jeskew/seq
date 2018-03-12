import { isSyncIterable } from './isIterable';

/**
 * Determines if any of the values yielded by the supplied iterator are equal to
 * (`===`) a particular value.
 *
 * @param searchElement The value against which all yielded values will be
 *                      compared
 */
export async function includes<T>(
    searchElement: T,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    return isSyncIterable(iterable)
        ? includesSync(searchElement, iterable)
        : includesAsync(searchElement, iterable);
}

export function includesSync<T>(searchElement: T, iterable: Iterable<T>) {
    for (const element of iterable) {
        if (element === searchElement) {
            return true;
        }
    }

    return false;
}

async function includesAsync<T>(searchElement: T, iterable: AsyncIterable<T>) {
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
        if (value === searchElement) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
            return true;
        }
    }

    return false;
}
