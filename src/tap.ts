import { iteratorFromIterable } from './iteratorFromIterable';

/**
 * Execute an action for each value yielded by the provided iterable.
 *
 * @param action    A side-effect producing function that consumes values
 *                  yielded by the provided iterable and returns nothing or a
 *                  promise that resolves to `void`.
 *
 * @returns a iterable that will yield all values yielded by the provided
 * `iterable`.
 */
export function tap<T>(
    action: (arg: T) => void|Promise<void>,
    iterable: Iterable<T>|AsyncIterable<T>
): AsyncIterableIterator<T> {
    return new TapIterator(action, iterable);
}

class TapIterator<T> implements AsyncIterableIterator<T> {
    private readonly iterator: Iterator<T>|AsyncIterator<T>;

    constructor(
        private readonly action: (arg: T) => void|Promise<void>,
        iterable: Iterable<T>|AsyncIterable<T>
    ) {
        this.iterator = iteratorFromIterable(iterable);
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next() {
        const { done, value } = await this.iterator.next();
        if (!done) {
            await this.action(value);
        }

        return { done, value };
    }

    async return() {
        if (typeof this.iterator.return === 'function') {
            return this.iterator.return();
        }

        return { done: true } as IteratorResult<T>;
    }
}
