import { isSyncIterable } from './isIterable';

/**
 * Collects the values yielded by a synchronous or asynchronous iterable into an
 * array.
 */
export async function collect<T>(
    iterable: Iterable<T>|AsyncIterable<T>
): Promise<Array<T>> {
    if (isSyncIterable(iterable)) {
        return [...iterable]
    }

    const iterator = iterable[Symbol.asyncIterator]();
    const collected: Array<T> = [];
    for (
        let next = await iterator.next(),
            value = next.value,
            done = next.done;
        !done;
        next = await iterator.next(),
        value = next.value,
        done = next.done
    ) {
        collected.push(value);
    }

    return collected;
}
