import { iteratorFromIterable } from './iteratorFromIterable';

/**
 * Mix zero or more synchronous or asynchronous iterables by alternating between
 * them.
 */
export async function *interleave<T>(
    ...iterables: Array<Iterable<T>|AsyncIterable<T>>
) {
    const cursors = new Map<
        Iterator<T>|AsyncIterator<T>,
        IteratorResult<T>|Promise<IteratorResult<T>>
    >(function *() {
        for (const iterable of iterables) {
            const iterator = iteratorFromIterable(iterable);
            yield [iterator, iterator.next()] as [
                Iterator<T>|AsyncIterator<T>,
                IteratorResult<T>|Promise<IteratorResult<T>>
            ];
        }
    }());

    while (cursors.size > 0) {
        for (const [iterator, result] of cursors) {
            const {value, done} = await result;
            if (!done || value !== undefined) {
                yield value;
            }

            if (done) {
                cursors.delete(iterator);
            } else {
                cursors.set(iterator, iterator.next());
            }
        }
    }
}
