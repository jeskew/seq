export abstract class AsyncIterableDecorator<T> implements
    AsyncIterableIterator<T>
{
    protected readonly iterator: AsyncIterator<T>;

    constructor(iterable: AsyncIterable<T>) {
        this.iterator = iterable[Symbol.asyncIterator]();
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    abstract next(): Promise<IteratorResult<T>>;

    return(): Promise<IteratorResult<T>> {
        if (typeof this.iterator.return === 'function') {
            return this.iterator.return();
        }

        return Promise.resolve({done: true} as IteratorResult<T>);
    }
}
