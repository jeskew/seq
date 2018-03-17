import { AsyncIterableDecorator } from './AsyncIterableDecorator';
import { isSyncIterable } from './isIterable';

/**
 * Creates an asynchronous iterable of all but the first `toSkip` items in the
 * provided iterable.
 *
 * @param toSkip    The number of values from the underlying iterable to skip.
 */
export function skip<T>(
    toSkip: number,
    iterable: Iterable<T>
): IterableIterator<T>;

export function skip<T>(
    toSkip: number,
    iterable: AsyncIterable<T>
): AsyncIterableIterator<T>;

export function skip<T>(
    toSkip: number,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T>;

export function skip<T>(
    toSkip: number,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return skipSync(toSkip, iterable);
    }

    return new SkipIterator(toSkip, iterable);
}

export function *skipSync<T>(toSkip: number, iterable: Iterable<T>) {
    let index = 0;
    for (const element of iterable) {
        if (++index > toSkip) {
            yield element;
        }
    }
}

class SkipIterator<T> extends AsyncIterableDecorator<T> {
    private index = 0

    constructor(
        private readonly toSkip: number,
        iterable: AsyncIterable<T>
    ) {
        super(iterable);
    }

    async next(): Promise<IteratorResult<T>> {
        const {value, done} = await this.iterator.next();
        if (done) {
            return { done, value };
        }

        if (++this.index > this.toSkip) {
            return { done, value };
        }

        return this.next();
    }
}
