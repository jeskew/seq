import { iteratorFromIterable } from './iteratorFromIterable';

/**
 * Reduces an iterable to a single value by applying the provided `reducer`
 * function against an accumulator and each element yielded by the iterable (in
 * the order in which they are received).
 *
 * The first invocation of the reducer will receive the first value yielded by
 * the underlying iterable as its accumulator and the second value yielded as
 * its currentValue argument.
 */
export async function reduce<T>(
    reducer: (accumulator: T, currentValue: T) => T|Promise<T>,
    iterable: Iterable<T>|AsyncIterable<T>
): Promise<T>;

/**
 * Reduces an iterable to a single value by applying the provided `reducer`
 * function against an accumulator and each element yielded by the iterable (in
 * the order in which they are received).
 *
 * @param initialValue  The value to use as the accumulator on the first
 *                      invocation of the reducer function.
 */
export async function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R|Promise<R>,
    initialValue: R,
    iterable: Iterable<T>|AsyncIterable<T>
): Promise<R>;

export async function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R|Promise<R>,
    iterableOrInitialValue: R|Iterable<T>|AsyncIterable<T>,
    iterable?: Iterable<T>|AsyncIterable<T>
) {
    let value: R = iterableOrInitialValue as R;
    let initialized = true;
    if (!iterable) {
        iterable = iterableOrInitialValue as Iterable<T>|AsyncIterable<T>;
        initialized = false;
    }

    const iterator = iteratorFromIterable(iterable);
    for (
        let next = await iterator.next(),
            element = next.value,
            done = next.done;
        !done;
        next = await iterator.next(),
        element = next.value,
        done = next.done
    ) {
        if (initialized) {
            value = await reducer(value, element);
        } else {
            value = <R><any>element;
            initialized = true;
        }
    }

    return value;
}
