import { isSyncIterable } from './isIterable';

/**
 * Collects the values yielded by a synchronous or asynchronous iterable into an
 * array.
 */
export async function collect<T>(iterable: Iterable<T>|AsyncIterable<T>) {
    if (isSyncIterable(iterable)) {
        return [...iterable]
    }

    const iterator = iterable[Symbol.asyncIterator]();
    const collected: Array<T> = [];
    try {
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
    } catch (err) {
        if (typeof iterator.return === 'function') {
            await iterator.return();
        }

        throw err;
    }

    return collected;
}
