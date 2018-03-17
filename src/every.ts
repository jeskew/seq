import { isSyncIterable } from './isIterable';

/**
 * Determines whether all items yielded by an iterable satisfy the supplied
 * predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean.
 */
export function every<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
): boolean;

export function every<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
): Promise<boolean>;

export function every<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): Promise<boolean>;

export function every<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): boolean|Promise<boolean> {
    if (isSyncIterable(iterable)) {
        return everySync(predicate, iterable);
    }

    return everyAsync(predicate, iterable);
}

export function everySync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
) {
    for (const element of iterable) {
        if (!predicate(element)) {
            return false;
        }
    }

    return true;
}

async function everyAsync<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
) {
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
        if (!predicate(value)) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
            return false;
        }
    }

    return true;
}
