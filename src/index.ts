/**
 * Provides a simple polyfill for runtime environments that provide a Symbol
 * implementation but do not have Symbol.asyncIterator available by default.
 */
if (Symbol && !Symbol.asyncIterator) {
    (Symbol as any).asyncIterator = Symbol.for("__@@asyncIterator__");
}

/**
 * @returns a promise resolved with an array of the values yielded by the
 * provided `iterable`.
 */
export async function collect<T>(
    iterable: AsyncIterable<T>|Iterable<T>
) {
    const collected: Array<T> = [];
    for await (const item of iterable) {
        collected.push(item);
    }

    return collected;
}

/**
 * @returns a single async iterable combining any number of synchronous or
 * asynchronous iterables. The resulting iterable will yield all values from the
 * first iterable provided, followed by all values yielded by the next iterable,
 * etc., for each iterable provided as an argument.
 */
export async function *concat<T>(
    ...iterables: Array<AsyncIterable<T>|Iterable<T>>
) {
    for (const iterable of iterables) {
        for await (const element of iterable) {
            yield element;
        }
    }
}

/**
 * @returns an iterable that yields values yielded by the provided `iterable`
 * with duplicates removed. Distinctness is evaluated by maintaining a set
 * of previously yielded values, i.e., it is evaluated via the [`SameValueZero`
 * algorithm](http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * described in the ECMAScript 2015 specification.
 */
export async function *distinct<T>(
    iterable: AsyncIterable<T>|Iterable<T>
) {
    const seen = new Set<T>();
    for await (const element of iterable) {
        if (!seen.has(element)) {
            yield element;
            seen.add(element);
        }
    }
}

/**
 * @returns when the provided predicate returns `true` for each item yielded by
 * the provided iterable.
 */
export async function every<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        if (!predicate(element)) {
            return false;
        }
    }

    return true;
}

/**
 * @returns an asynchronous iterator that yields each value yielded by the
 *  provided iterable for which the provided predicate returns `true`.
 */
export async function *filter<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        if (predicate(element)) {
            yield element;
        }
    }
}

/**
 * @returns the first value yielded by the provided iterable for which the
 * provided predicate returns `true`.
 */
export async function find<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        if (predicate(element)) {
            return element;
        }
    }

    throw new Error('No yielded value satisfied the provided condition');
}

/**
 * @returns `true` if the provided `searchElement` is yielded by the provided
 * `iterable`.
 */
export async function includes<T>(
    searchElement: T,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        if (element === searchElement) {
            return true;
        }
    }

    return false;
}

/**
 * @returns an iterable that yields a value from each iterable provided as an
 * argument.
 */
export async function *interleave<T>(
    ...iterables: Array<AsyncIterable<T>|Iterable<T>>
) {
    const cursors = new Map<
        Iterator<T>|AsyncIterator<T>,
        IteratorResult<T>|Promise<IteratorResult<T>>
    >(function *() {
        for (const iterable of iterables) {
            const iterator = iteratorFromIterable(iterable);
            yield [iterator, iterator.next()] as [
                Iterator<T>|AsyncIterator<T>,
                IteratorResult<T>|Promise<IteratorResult<T>>
            ];
        }
    }());

    while (cursors.size > 0) {
        for (const [iterator, result] of cursors) {
            const {value, done} = await result;
            if (!done || value !== undefined) {
                yield value;
            }

            if (done) {
                cursors.delete(iterator);
            } else {
                cursors.set(iterator, iterator.next());
            }
        }
    }
}

/**
 * @returns an iterable that yields the result of apply the provided `f`
 * function to each value yielded by the provided `iterable`.
 */
export async function *map<T, R>(
    f: (arg: T) => R,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        yield f(element);
    }
}

/**
 * @returns an iterable that yields values from all provided iterables as they
 * become available.
 *
 * When the iterables provided are synchronous, `merge` is equivalent to
 * `interleave`, but when one or more of the iterables are asynchronous, values
 * will be yielded from each iterable as soon as they are ready.
 *
 * Inspired by [RxJS's `merge`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-merge)
 * operator.
 */
export async function *merge<T>(
    ...iterables: Array<Iterable<T>|AsyncIterable<T>>
) {
    const pendingResults: Array<PendingResult<T>> = [];
    for (const iterable of iterables) {
        refillPending(pendingResults, iteratorFromIterable(iterable));
    }

    while (pendingResults.length > 0) {
        const {
            result: {value, done},
            iterator
        } = await Promise.race(pendingResults.map(val => val.result));

        for (let i = pendingResults.length - 1; i >= 0; i--) {
            if (pendingResults[i].iterator === iterator) {
                pendingResults.splice(i, 1);
            }
        }

        if (!done) {
            yield value;
            refillPending(pendingResults, iterator);
        }
    }
}

interface PendingResult<T> {
    iterator: Iterator<T>|AsyncIterator<T>;
    result: Promise<{
        iterator: Iterator<T>|AsyncIterator<T>;
        result: IteratorResult<T>
    }>;
}

function refillPending<T>(
    pending: Array<PendingResult<T>>,
    iterator: Iterator<T>|AsyncIterator<T>
): void {
    const result = Promise.resolve(iterator.next()).then(resolved => ({
        iterator,
        result: resolved
    }));
    pending.push({iterator, result});
}

/**
 * @returns a synchronous iterator that yields values between `start` and `end`,
 * counting up by `step`.
 *
 * If `start` is not provided, a default of `0` is used.
 * If `step` is not provided, a default of `1` is used.
 */
export function range(end: number): IterableIterator<number>;
export function range(start: number, end: number): IterableIterator<number>;
export function range(
    start: number,
    end: number,
    step: number
): IterableIterator<number>;
export function *range(
    startOrEnd: number,
    end?: number,
    step?: number
) {
    let start: number = startOrEnd;
    if (end === undefined) {
        start = 0;
        end = startOrEnd;
    }

    if (step === undefined) {
        step = 1;
    }

    while (start < end) {
        yield start;
        start += step;
    }
}

/**
 * @returns a promise that will resolve with the result of applying the provided
 * `reducer` function against an accumulator and each value yielded by the
 * underlying iterable to reduce it to a single value.
 *
 * If no `initialValue` is provided, the first value yielded by the iterable
 * will be used in its place.
 */
export async function reduce<T>(
    reducer: (accumulator: T, currentValue: T) => T,
    iterable: Iterable<T>|AsyncIterable<T>
): Promise<T>;
export async function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R,
    initialValue: R,
    iterable: Iterable<T>|AsyncIterable<T>
): Promise<R>;
export async function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R,
    iterableOrInitialValue: R|Iterable<T>|AsyncIterable<T>,
    iterable?: Iterable<T>|AsyncIterable<T>
) {
    let value: R = iterableOrInitialValue as R;
    let initialized = true;
    if (!iterable) {
        iterable = iterableOrInitialValue as Iterable<T>|AsyncIterable<T>;
        initialized = false;
    }

    for await (const element of iterable) {
        if (initialized) {
            value = reducer(value, element);
        } else {
            value = <R><any>element;
            initialized = true;
        }
    }

    return value;
}

/**
 * @returns an infinite, lazy iterator, of which each value yielded will be the
 * provided argument.
 */
export function *repeat<T>(toRepeat: T) {
    while (true) {
        yield toRepeat;
    }
}

/**
 * @returns an iterable that will yield all values yielded by the provided
 * `iterable` after skipping the first `toSkip` values.
 */
export async function *skip<T>(
    toSkip: number,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    let index = 0;
    for await (const element of iterable) {
        if (++index > toSkip) {
            yield element;
        }
    }
}

/**
 * @returns `true` if the provided `predicate` evaluates to `true` for any value
 * yielded by the provided `iterable`.
 */
export async function some<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        if (predicate(element)) {
            return true;
        }
    }

    return false;
}

/**
 * @returns the sum of all values yielded by the provided `iterable`.
 */
export async function sum(
    iterable: AsyncIterable<number>|Iterable<number>
): Promise<number> {
    let sum = 0;
    for await (const element of iterable) {
        sum += element;
    }

    return sum;
}

/**
 * @returns an iterable that will yield at most `limit` values from the provided
 * `iterable`.
 */
export async function *take<T>(
    limit: number,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    if (limit <= 0) return;

    let i = 0;
    for await (const element of iterable) {
        yield element;
        if (++i >= limit) break;
    }
}

/**
 * @returns an iterable that will yield values from the provided `iterable` so
 * long as `predicate` returns `true`. Once the `predicate` returns `false` for
 * any value, iteration will cease.
 */
export async function *takeWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        if (predicate(element)) {
            yield element;
        } else {
            break;
        }
    }
}

/**
 * @returns a iterable that will yield all values yielded by the provided
 * `iterable`. Additionally, the provided `action` will be invoked with each
 * value, allowing side effects to be performed.
 */
export async function *tap<T>(
    action: (arg: T) => void,
    iterable: AsyncIterable<T>|Iterable<T>
) {
    for await (const element of iterable) {
        action(element);
        yield element;
    }
}

/**
 * @returns an iterable of tuple pairs, where the elements of each pair are
 * corresponding elements of `keys` and `values`.
 *
 * If the two provided iterables are different lengths, the resulting iterable
 * will be the same length as the shorter of the two.
 */
export async function *zip<K, V>(
    keys: AsyncIterable<K>|Iterable<K>,
    values: AsyncIterable<V>|Iterable<V>
) {
    const keyIterator = iteratorFromIterable(keys);
    const valueIterator = iteratorFromIterable(values);

    while (true) {
        const {done: keysDone, value: key} = await keyIterator.next();
        const {done: valuesDone, value} = await valueIterator.next();

        if (keysDone || valuesDone) {
            break;
        }

        yield [key, value];
    }
}

function iteratorFromIterable<T>(
    iterable?: Iterable<T>|AsyncIterable<T>
): Iterator<T>|AsyncIterator<T> {
    if (typeof (iterable as AsyncIterable<T>)[Symbol.asyncIterator] === 'function') {
        return (iterable as AsyncIterable<T>)[Symbol.asyncIterator]();
    }

    return (iterable as Iterable<T>)[Symbol.iterator]();
}
