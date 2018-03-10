import { isSyncIterable } from './isIterable';

/**
 * Removes duplicates from a synchronous or asynchronous iterable.
 *
 * Distinctness is evaluated by maintaining a set of previously yielded values,
 * i.e., it is evaluated via the [`SameValueZero` algorithm](http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * described in the ECMAScript 2015 specification.
 */
export function distinct<T>(
    iterable: Iterable<T>|AsyncIterable<T>
): Iterable<T>|AsyncIterable<T> {
    if (isSyncIterable(iterable)) {
        return distinctSync(iterable);
    }

    return new Deduplicator(iterable);
}

export function *distinctSync<T>(iterable: Iterable<T>): IterableIterator<T> {
    const seen = new Set<T>();
    for (const element of iterable) {
        if (!seen.has(element)) {
            yield element;
            seen.add(element);
        }
    }
}

class Deduplicator<T> implements AsyncIterableIterator<T> {
    private readonly iterator: AsyncIterator<T>;
    private readonly seen = new Set<T>();

    constructor(iterable: AsyncIterable<T>) {
        this.iterator = iterable[Symbol.asyncIterator]();
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    next(): Promise<IteratorResult<T>> {
        return this.iterator.next().then(({done, value}) => {
            if (done) {
                return {done, value};
            }

            if (this.seen.has(value)) {
                return this.next();
            } else {
                this.seen.add(value);
                return {done, value};
            }
        })
    }

    return(): Promise<IteratorResult<T>> {
        if (typeof this.iterator.return === 'function') {
            return this.iterator.return();
        }

        return Promise.resolve({done: true} as IteratorResult<T>);
    }
}
