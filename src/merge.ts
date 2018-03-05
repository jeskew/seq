import { iteratorFromIterable } from './iteratorFromIterable';

/**
 * Creates an asynchronous iterable that concurrently emits all values yielded
 * from zero or more synchronous or asynchronous iterables.
 *
 * When the iterables provided are synchronous, `merge` is equivalent to
 * `interleave`, but when one or more of the iterables are asynchronous, values
 * will be yielded from each iterable as soon as they are ready.
 *
 * Inspired by [RxJS's `merge`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-merge)
 * operator.
 */
export async function *merge<T>(
    ...iterables: Array<Iterable<T>|AsyncIterable<T>>
) {
    const pendingResults: Array<PendingResult<T>> = [];
    for (const iterable of iterables) {
        refillPending(pendingResults, iteratorFromIterable(iterable));
    }

    while (pendingResults.length > 0) {
        const {
            result: {value, done},
            iterator
        } = await Promise.race(pendingResults.map(val => val.result));

        for (let i = pendingResults.length - 1; i >= 0; i--) {
            if (pendingResults[i].iterator === iterator) {
                pendingResults.splice(i, 1);
            }
        }

        if (!done) {
            yield value;
            refillPending(pendingResults, iterator);
        }
    }
}

interface PendingResult<T> {
    iterator: Iterator<T>|AsyncIterator<T>;
    result: Promise<{
        iterator: Iterator<T>|AsyncIterator<T>;
        result: IteratorResult<T>
    }>;
}

function refillPending<T>(
    pending: Array<PendingResult<T>>,
    iterator: Iterator<T>|AsyncIterator<T>
): void {
    const result = Promise.resolve(iterator.next()).then(resolved => ({
        iterator,
        result: resolved
    }));
    pending.push({iterator, result});
}
