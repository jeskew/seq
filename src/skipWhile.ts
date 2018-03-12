import { iteratorFromIterable } from './iteratorFromIterable';

/**
 * Creates an asynchronous iterable of all but the first items in the provided
 * iterable for which the provided predicate returns true. Once the predicate
 * returns `false`, all subsequent values will be yielded.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export function skipWhile<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: Iterable<T>|AsyncIterable<T>
): AsyncIterableIterator<T> {
    return new SkipWhileIterator(predicate, iterable);
}

class SkipWhileIterator<T> implements AsyncIterableIterator<T> {
    private readonly iterator: Iterator<T>|AsyncIterator<T>;
    private satisfied = true

    constructor(
        private readonly predicate: (arg: T) => boolean|Promise<boolean>,
        iterable: Iterable<T>|AsyncIterable<T>
    ) {
        this.iterator = iteratorFromIterable(iterable);
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next(): Promise<IteratorResult<T>> {
        const {value, done} = await this.iterator.next();
        if (done) {
            return { done, value };
        }

        if (!this.satisfied || !(this.satisfied = await this.predicate(value))) {
            return { done, value };
        }

        return this.next();
    }

    async return(): Promise<IteratorResult<T>> {
        if (typeof this.iterator.return === 'function') {
            return this.iterator.return();
        }

        return { done: true } as IteratorResult<T>;
    }
}
