import { AsyncIterableDecorator } from './AsyncIterableDecorator';
import { isSyncIterable } from './isIterable';

/**
 * Yields values from the provided iterable while they satisfy the provided
 * predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean.
 */
export function takeWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
): IterableIterator<T>;

export function takeWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
): AsyncIterableIterator<T>;

export function takeWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T>;

export function takeWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T>|AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return takeWhileSync(predicate, iterable);
    }

    return new TakeWhileIterator(predicate, iterable);
}

export function *takeWhileSync<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<T> {
    for (const element of iterable) {
        if (predicate(element)) {
            yield element;
        } else {
            break;
        }
    }
}

class TakeWhileIterator<T> extends AsyncIterableDecorator<T> {
    private finished = false

    constructor(
        private readonly predicate: (arg: T) => boolean,
        iterable: AsyncIterable<T>
    ) {
        super(iterable);
    }

    async next(): Promise<IteratorResult<T>> {
        if (this.finished) {
            return { done: true } as IteratorResult<T>;
        }

        const {value, done} = await this.iterator.next();
        if (done || !(this.finished = !this.predicate(value))) {
            return { done, value };
        }

        return this.return();
    }

    return() {
        this.finished = true;
        return super.return();
    }
}
