import { AsyncIterableDecorator } from './AsyncIterableDecorator';
import { isSyncIterable } from './isIterable';

/**
 * Removes values that fail to satisfy the supplied predicate from the supplied
 * iterable.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export function filter<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return filterSync(predicate, iterable);
    }

    return new FilterIterator(predicate, iterable);
}

export function *filterSync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
) {
    for (const element of iterable) {
        if (predicate(element)) {
            yield element;
        }
    }
}

class FilterIterator<T> extends AsyncIterableDecorator<T> {
    constructor(
        private readonly predicate: (arg: T) => boolean,
        iterable: AsyncIterable<T>
    ) {
        super(iterable);
    }

    async next(): Promise<IteratorResult<T>> {
        const {value, done} = await this.iterator.next();
        if (done || this.predicate(value)) {
            return {value, done};
        }

        return this.next();
    }
}
