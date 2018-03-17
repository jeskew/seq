import { iteratorFromIterable } from './iteratorFromIterable';

export abstract class AsyncIterableDecorator<T> implements
    AsyncIterableIterator<T>
{
    protected readonly iterator: Iterator<T>|AsyncIterator<T>;

    constructor(iterable: Iterable<T>|AsyncIterable<T>) {
        this.iterator = iteratorFromIterable(iterable);
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    abstract next(): Promise<IteratorResult<T>>;

    async return(): Promise<IteratorResult<T>> {
        if (typeof this.iterator.return === 'function') {
            return this.iterator.return();
        }

        return {done: true} as IteratorResult<T>;
    }
}
