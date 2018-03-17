import { AsyncIterableDecorator } from './AsyncIterableDecorator';
import { isSyncIterable } from './isIterable';

/**
 * Creates an asynchronous iterable of all but the first items in the provided
 * iterable for which the provided predicate returns true. Once the predicate
 * returns `false`, all subsequent values will be yielded.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean.
 */
export function skipWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
): IterableIterator<T>;

export function skipWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
): AsyncIterableIterator<T>;

export function skipWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T>;

export function skipWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return skipWhileSync(predicate, iterable);
    }

    return new SkipWhileIterator(predicate, iterable);
}

export function *skipWhileSync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
) {
    let satisfied = true;
    for (const element of iterable) {
        if (!satisfied || !(satisfied = predicate(element))) {
            yield element;
        }
    }
}

class SkipWhileIterator<T> extends AsyncIterableDecorator<T> {
    private satisfied = true

    constructor(
        private readonly predicate: (arg: T) => boolean,
        iterable: AsyncIterable<T>
    ) {
        super(iterable);
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
}
