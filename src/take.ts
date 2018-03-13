import { AsyncIterableDecorator } from './AsyncIterableDecorator';
import { isSyncIterable } from './isIterable';

/**
 * Returns a lazy sequence of the first `limit` items in the provided iterable,
 * or all items if there are fewer than `limit`.
 *
 * @param limit The maximum number of items to return.
 */
export function take<T>(
    limit: number,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return takeSync(limit, iterable);
    }

    return new TakeIterator(limit, iterable);
}

export function *takeSync<T>(limit: number, iterable: Iterable<T>) {
    if (limit <= 0) return;

    let i = 0;
    for (const element of iterable) {
        yield element;
        if (++i >= limit) break;
    }
}


class TakeIterator<T> extends AsyncIterableDecorator<T> {
    private index = 0

    constructor(
        private readonly toTake: number,
        iterable: AsyncIterable<T>
    ) {
        super(iterable);
    }

    async next(): Promise<IteratorResult<T>> {
        if (++this.index > this.toTake) {
            return this.return();
        }

        return this.iterator.next();
    }
}
