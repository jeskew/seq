import { filterSync } from './filter';
import { iteratorFromIterable } from './iteratorFromIterable';
import { mapSync } from './map';

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
export function merge<T>(
    ...iterables: Array<Iterable<T>|AsyncIterable<T>>
): AsyncIterableIterator<T> {
    return new MergeIterator(iterables);
}

class MergeIterator<T> implements AsyncIterableIterator<T> {
    private readonly pending: Array<[
        Iterator<T>|AsyncIterator<T>,
        Promise<IteratorResult<Iterator<T>|AsyncIterator<T>>>
    ]> = [];
    private readonly resolved: Array<T> = [];

    constructor(iterables: Iterable<Iterable<T>|AsyncIterable<T>>) {
        for (const iterable of iterables) {
            this.refillPending(iteratorFromIterable(iterable));
        }
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next(): Promise<IteratorResult<T>> {
        if (this.resolved.length > 0) {
            return { done: false, value: this.resolved.shift() as T };
        }

        if (this.pending.length === 0) {
            return { done: true } as IteratorResult<T>;
        }

        const {done, value} = await Promise.race(
            mapSync(pair => pair[1], this.pending)
        );

        for (let i = this.pending.length - 1; i >= 0; i--) {
            if (this.pending[i][0] === value) {
                this.pending.splice(i, 1);
            }
        }

        if (!done) {
            this.refillPending(value);
        }

        return this.next();
    }

    async return(): Promise<IteratorResult<T>> {
        await Promise.all(returnIterators(
            mapSync(pair => pair[0], this.pending)
        ));
        this.pending.length = 0;

        return { done: true } as IteratorResult<T>;
    }

    private refillPending(iterator: Iterator<T>|AsyncIterator<T>) {
        this.pending.push([
            iterator,
            Promise.resolve(iterator.next()).then(
                ({done, value}) => {
                    if (!done) {
                        this.resolved.push(value);
                    }
                    return {done, value: iterator};
                },
                err => {
                    const returnErr = () => Promise.reject(err);
                    return Promise.all(returnIterators(filterSync(
                        iter => iter !== iterator,
                        mapSync(pair => pair[0], this.pending)
                    ))).then(returnErr, returnErr);
                }
            )
        ]);
    }
}

function returnIterators(
    iterators: Iterable<Iterator<any>|AsyncIterator<any>>
): Iterable<Promise<void|IteratorResult<any>>> {
    return mapSync(
        async (iterator): Promise<void|IteratorResult<any>> => {
            if (typeof iterator.return === 'function') {
                return iterator.return();
            }
        },
        iterators
    );
}
