import { AsyncIterableDecorator } from './AsyncIterableDecorator';
import { isSyncIterable } from './isIterable';

/**
 * Transforms each value yielded by the supplied iterable by calling the
 * supplied and returning the result.
 *
 * @param f The function to call with each value yielded by the provided
 *          iterable.
 */
export function map<T, R>(
    f: (arg: T) => R,
    iterable: Iterable<T>
): IterableIterator<R>;

export function map<T, R>(
    f: (arg: T) => R,
    iterable: AsyncIterable<T>
): AsyncIterableIterator<R>;

export function map<T, R>(
    f: (arg: T) => R,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<R>|AsyncIterableIterator<R>;

export function map<T, R>(
    f: (arg: T) => R,
    iterable: Iterable<T>|AsyncIterable<T>
): IterableIterator<R>|AsyncIterableIterator<R> {
    if (isSyncIterable(iterable)) {
        return mapSync(f, iterable);
    }

    return new MapIterator(f, iterable);
}

export function *mapSync<T, R>(f: (arg: T) => R, iterable: Iterable<T>) {
    for (const element of iterable) {
        yield f(element);
    }
}

class MapIterator<T, R> extends AsyncIterableDecorator<R> {
    constructor(
        private readonly f: (arg: T) => R,
        iterable: AsyncIterable<T>
    ) {
        super(iterable as any);
    }

    next(): Promise<IteratorResult<R>> {
        return this.iterator.next().then(({done, value}: any) => {
            if (done) {
                return { done } as IteratorResult<R>;
            }

            return { done, value: this.f(value) };
        })
    }
}
