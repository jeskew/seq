import { iteratorFromIterable } from './iteratorFromIterable';

/**
 * Mix zero or more synchronous or asynchronous iterables by alternating between
 * them.
 */
export function interleave<T>(
    ...iterables: Array<Iterable<T>|AsyncIterable<T>>
): AsyncIterableIterator<T> {
    return new InterleavingIterator(iterables);
}

class InterleavingIterator<T> implements AsyncIterableIterator<T> {
    private current = 0
    private readonly iterators: Array<Iterator<T>|AsyncIterator<T>> = []

    constructor(
        private readonly sourceIterables: Array<Iterable<T>|AsyncIterable<T>>
    ) {}

    [Symbol.asyncIterator]() {
        return this;
    }

    async next(): Promise<IteratorResult<T>> {
        if (this.sourceIterables.length > 0) {
            this.iterators.push(iteratorFromIterable(
                this.sourceIterables.shift() as Iterable<T>|AsyncIterable<T>
            ));
        }

        if (this.iterators.length === 0) {
            return { done: true } as IteratorResult<T>;
        }

        const { done, value } = await this.iterators[this.current].next();
        if (done) {
            this.iterators.splice(this.current, 1);
            if (this.current === this.iterators.length) {
                this.current = 0
            }
            return this.next();
        }

        if (
            ++this.current >= this.iterators.length &&
            this.sourceIterables.length === 0
        ) {
            this.current = 0
        }

        return { done, value };
    }

    async return(): Promise<IteratorResult<T>> {
        this.sourceIterables.length = 0;
        let iterator: Iterator<T>|AsyncIterator<T>|undefined;
        while (iterator = this.iterators.pop()) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
        }

        return { done: true } as IteratorResult<T>;
    }
}
