/**
 * Provides a simple polyfill for runtime environments that provide a Symbol
 * implementation but do not have Symbol.asyncIterator available by default.
 */
if (Symbol && !Symbol.asyncIterator) {
    (Symbol as any).asyncIterator = Symbol.for("__@@asyncIterator__");
}

/**
 * A synchronous or asynchronous iterable.
 */
export type SyncOrAsyncIterable<T> = AsyncIterable<T>|Iterable<T>;

/**
 * A synchronous or asynchronous iterator.
 */
export type SyncOrAsyncIterator<T> = AsyncIterator<T>|Iterator<T>;

/**
 * The result of a synchronous or asynchronous iterator.
 */
export type SyncOrAsyncIteratorResult<T>
    = IteratorResult<T>|Promise<IteratorResult<T>>;

/**
 * A synchronous iterable whose elements are either of type T or are themselves
 * synchronous or asynchronous iterables of an arbitrary depth.
 */
export interface RecursiveSyncIterable<T> extends
    Iterable<T|RecursiveIterable<T>>
{}

/**
 * An asynchronous iterable whose elements are either of type T or are
 * themselves synchronous or asynchronous iterables of an arbitrary depth.
 */
export interface RecursiveAsyncIterable<T> extends
    AsyncIterable<T|RecursiveIterable<T>>
{}

/**
 * A synchronous or asynchronous iterable whose elements are either of type T or
 * are themselves synchronous or asynchronous iterables of an arbitrary depth.
 */
export type RecursiveIterable<T> = RecursiveSyncIterable<T>|RecursiveAsyncIterable<T>;

/**
 * An element yielded by an iterable that may or may not be iterable itself.
 */
export type ElementOrIterable<T> = T|SyncOrAsyncIterable<T>;

/**
 * Collects the values yielded by a synchronous or asynchronous iterable into an
 * array.
 */
export async function collect<T>(iterable: SyncOrAsyncIterable<T>) {
    const collected: Array<T> = [];
    for await (const item of iterable) {
        collected.push(item);
    }

    return collected;
}

/**
 * Combines zero or more synchronous or asynchronous iterables into a single
 * async iterable. The resulting iterable will yield all values from the first
 * iterable provided, followed by all values yielded by the next iterable, etc.,
 * for each iterable provided as an argument.
 */
export function concat<T>(...iterables: Array<SyncOrAsyncIterable<T>>) {
    return flatten(iterables);
}

/**
 * Removes duplicates from a synchronous or asynchronous iterable.
 *
 * Distinctness is evaluated by maintaining a set of previously yielded values,
 * i.e., it is evaluated via the [`SameValueZero` algorithm](http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * described in the ECMAScript 2015 specification.
 */
export async function *distinct<T>(iterable: SyncOrAsyncIterable<T>) {
    const seen = new Set<T>();
    for await (const element of iterable) {
        if (!seen.has(element)) {
            yield element;
            seen.add(element);
        }
    }
}

/**
 * Determines whether all items yielded by an iterable satisfy the supplied
 * predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function every<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: SyncOrAsyncIterable<T>
) {
    for await (const element of iterable) {
        if (!(await predicate(element))) {
            return false;
        }
    }

    return true;
}

/**
 * Removes values that fail to satisfy the supplied predicate from the supplied
 * iterable.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function *filter<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: SyncOrAsyncIterable<T>
) {
    for await (const element of iterable) {
        if (await predicate(element)) {
            yield element;
        }
    }
}

/**
 * Locates the first value yielded by the supplied iterable that satisfies the
 * supplied predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function find<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: SyncOrAsyncIterable<T>
) {
    for await (const element of iterable) {
        if (await predicate(element)) {
            return element;
        }
    }

    throw new Error('No yielded value satisfied the provided condition');
}

/**
 * Maps each element yielded by the supplied iterable and flattens the result.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param f         The function to apply to every value yielded by the supplied
 *                  iterable.
 */
export function flatMap<T, R>(
    f: (arg: T) => R|Promise<R>|SyncOrAsyncIterable<R>,
    iterable: SyncOrAsyncIterable<T>
): AsyncIterableIterator<R> {
    return flatten(map<T, R|SyncOrAsyncIterable<R>>(f, iterable));
}

/**
 * Flattens an iterable that yields elements of type T or
 * {SyncOrAsyncIterable}<T> into an interable that yields elements of type T.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param iterable The iterable to flatten
 */
export function flatten<T>(
    iterable: SyncOrAsyncIterable<ElementOrIterable<T>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to `depth` times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable. Specify `Infinity` to flatten the
 *                  iterable until it contains only non-iterable elements.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: number,
    iterable: RecursiveIterable<T>
): AsyncIterableIterator<T|RecursiveIterable<T>>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 0,
    iterable: SyncOrAsyncIterable<T>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to one time.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 1,
    iterable: SyncOrAsyncIterable<ElementOrIterable<T>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to two times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 2,
    iterable: SyncOrAsyncIterable<ElementOrIterable<ElementOrIterable<T>>>
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to three times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 3,
    iterable: SyncOrAsyncIterable<
        ElementOrIterable<
            ElementOrIterable<
                ElementOrIterable<T>
            >
        >
    >
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to four times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 4,
    iterable: SyncOrAsyncIterable<
        ElementOrIterable<
            ElementOrIterable<
                ElementOrIterable<
                    ElementOrIterable<T>
                >
            >
        >
    >
): AsyncIterableIterator<T>;

/**
 * Returns an asynchronous iterable that yields all elements yielded by the
 * provided iterator, flattened up to five times.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param depth     The number of times to recursively flatten elements that are
 *                  themselves iterable.
 * @param iterable  The iterable to flatten.
 */
export function flatten<T>(
    depth: 5,
    iterable: SyncOrAsyncIterable<
        ElementOrIterable<
            ElementOrIterable<
                ElementOrIterable<
                    ElementOrIterable<
                        ElementOrIterable<T>
                    >
                >
            >
        >
    >
): AsyncIterableIterator<T>;

export function flatten<T>(
    depthOrIterable: number|RecursiveIterable<T>,
    iterable?: RecursiveIterable<T>
) {
    let depth: number;
    if (typeof depthOrIterable === 'number') {
        depth = depthOrIterable;
    } else {
        depth = 1;
        iterable = depthOrIterable;
    }

    return flattenIntoIterable(depth, iterable as RecursiveIterable<T>);
}

/**
 * Determines if any of the values yielded by the supplied iterator are equal to
 * (`===`) a particular value.
 *
 * @param searchElement The value against which all yielded values will be
 *                      compared
 */
export async function includes<T>(
    searchElement: T,
    iterable: SyncOrAsyncIterable<T>
) {
    for await (const element of iterable) {
        if (element === searchElement) {
            return true;
        }
    }

    return false;
}

/**
 * Mix zero or more synchronous or asynchronous iterables by alternating between
 * them.
 */
export async function *interleave<T>(
    ...iterables: Array<SyncOrAsyncIterable<T>>
) {
    const cursors = new Map<
        SyncOrAsyncIterator<T>,
        SyncOrAsyncIteratorResult<T>
    >(function *() {
        for (const iterable of iterables) {
            const iterator = iteratorFromIterable(iterable);
            yield [iterator, iterator.next()] as [
                SyncOrAsyncIterator<T>,
                SyncOrAsyncIteratorResult<T>
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
 * Transforms each value yielded by the supplied iterable by calling the
 * supplied and returning the result.
 *
 * @param f The function to call with each value yielded by the provided
 *          iterable.
 */
export async function *map<T, R>(
    f: (arg: T) => R|Promise<R>,
    iterable: SyncOrAsyncIterable<T>
): AsyncIterableIterator<R> {
    for await (const element of iterable) {
        yield await f(element);
    }
}

/**
 * Creates an asynchronous iterable that concurrently emits all values yielded
 * from zero or more synchronous or asynchronous iterables.
 *
 * When the iterables provided are synchronous, `merge` is equivalent to
 * `interleave`, but when one or more of the iterables are asynchronous, values
 * will be yielded from each iterable as soon as they are ready.
 *
 * Inspired by [RxJS's `merge`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-merge)
 * operator.
 */
export async function *merge<T>(
    ...iterables: Array<SyncOrAsyncIterable<T>>
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
    iterator: SyncOrAsyncIterator<T>;
    result: Promise<{
        iterator: SyncOrAsyncIterator<T>;
        result: IteratorResult<T>
    }>;
}

function refillPending<T>(
    pending: Array<PendingResult<T>>,
    iterator: SyncOrAsyncIterator<T>
): void {
    const result = Promise.resolve(iterator.next()).then(resolved => ({
        iterator,
        result: resolved
    }));
    pending.push({iterator, result});
}

/**
 * Yields all numbers (incrementing by `1` on each step) from 0 until `end` is
 * reached.
 *
 * @param end   The value that should serve as the upper bound of the range. It
 *              will not be included in the returned range.
 */
export function range(end: number): IterableIterator<number>;

/**
 * Yields all numbers (incrementing by `1` on each step) from `start` until
 * `end` is reached.
 *
 * @param start The value with which to begin the range.
 * @param end   The value that should serve as the upper bound of the range. It
 *              will not be included in the returned range.
 */
export function range(start: number, end: number): IterableIterator<number>;

/**
 * Yields all numbers (incrementing by `step` after each yield) from `start`
 * until `end` is reached.
 *
 * @param start The value with which to begin the range.
 * @param end   The value that should serve as the upper bound of the range. It
 *              will not be included in the returned range.
 * @param step  Difference between each number in the sequence.
 */
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

    const comparator = step > 0 ? lt : gt;
    while (comparator(start, end)) {
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
    reducer: (accumulator: T, currentValue: T) => T|Promise<T>,
    iterable: SyncOrAsyncIterable<T>
): Promise<T>;
export async function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R|Promise<R>,
    initialValue: R,
    iterable: SyncOrAsyncIterable<T>
): Promise<R>;
export async function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R|Promise<R>,
    iterableOrInitialValue: R|SyncOrAsyncIterable<T>,
    iterable?: SyncOrAsyncIterable<T>
) {
    let value: R = iterableOrInitialValue as R;
    let initialized = true;
    if (!iterable) {
        iterable = iterableOrInitialValue as SyncOrAsyncIterable<T>;
        initialized = false;
    }

    for await (const element of iterable) {
        if (initialized) {
            value = await reducer(value, element);
        } else {
            value = <R><any>element;
            initialized = true;
        }
    }

    return value;
}

/**
 * Creates an infinite, lazy iterator that will yield the same value until
 * iteration is stopped.
 *
 * @param toRepeat  The value to yield repeatedly.
 */
export function *repeat<T>(toRepeat: T) {
    while (true) {
        yield toRepeat;
    }
}

/**
 * Creates an asynchronous iterable of all but the first `toSkip` items in the
 * provided iterable.
 *
 * @param toSkip    The number of values from the underlying iterable to skip.
 */
export async function *skip<T>(
    toSkip: number,
    iterable: SyncOrAsyncIterable<T>
) {
    let index = 0;
    for await (const element of iterable) {
        if (++index > toSkip) {
            yield element;
        }
    }
}

/**
 * Creates an asynchronous iterable of all but the first items in the provided
 * iterable for which the provided predicate returns true. Once the predicate
 * returns `false`, all subsequent values will be yielded.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function *skipWhile<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: SyncOrAsyncIterable<T>
) {
    let satisfied = true;
    for await (const element of iterable) {
        if (!satisfied || !(satisfied = await predicate(element))) {
            yield element;
        }
    }
}

/**
 * Determines if any value yielded by the provided iterable satisfies the
 * provided predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function some<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: SyncOrAsyncIterable<T>
) {
    for await (const element of iterable) {
        if (await predicate(element)) {
            return true;
        }
    }

    return false;
}

/**
 * @returns the sum of all values yielded by the provided `iterable`.
 */
export async function sum(
    iterable: SyncOrAsyncIterable<number>
): Promise<number> {
    let sum = 0;
    for await (const element of iterable) {
        sum += element;
    }

    return sum;
}

/**
 * Returns a lazy sequence of the first `limit` items in the provided iterable,
 * or all items if there are fewer than `limit`.
 *
 * @param limit The maximum number of items to return.
 */
export async function *take<T>(
    limit: number,
    iterable: SyncOrAsyncIterable<T>
) {
    if (limit <= 0) return;

    let i = 0;
    for await (const element of iterable) {
        yield element;
        if (++i >= limit) break;
    }
}

/**
 * Yields values from the provided iterable while they satisfy the provided
 * predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function *takeWhile<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: SyncOrAsyncIterable<T>
) {
    for await (const element of iterable) {
        if (await predicate(element)) {
            yield element;
        } else {
            break;
        }
    }
}

/**
 * Execute an action for each value yielded by the provided iterable.
 *
 * @param action    A side-effect producing function that consumes values
 *                  yielded by the provided iterable and returns nothing or a
 *                  promise that resolves to `void`.
 *
 * @returns a iterable that will yield all values yielded by the provided
 * `iterable`.
 */
export async function *tap<T>(
    action: (arg: T) => void|Promise<void>,
    iterable: SyncOrAsyncIterable<T>
) {
    for await (const element of iterable) {
        await action(element);
        yield element;
    }
}

/**
 * Creates an iterable of tuple pairs that matches the iteration signature of
 * an ES6 Map object.
 *
 * If the two provided iterables are different lengths, the resulting iterable
 * will be the same length as the shorter of the two.
 *
 * @param keys      The values to use as the first member of each pair.
 * @param values    The values to use as the second member of each pair.
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

async function *flattenIntoIterable<T>(
    depth: number,
    iterable: RecursiveIterable<T>
): AsyncIterableIterator<T|RecursiveIterable<T>> {
    for await (const element of iterable) {
        if (typeof element !== 'string' && isIterable(element) && depth > 0) {
            yield* flattenIntoIterable(depth - 1, element);
        } else {
            yield element;
        }
    }
}

function gt(a: number, b: number): boolean {
    return a > b;
}
function isAsyncIterable<T>(arg: any): arg is AsyncIterable<T> {
    return Boolean(arg) && typeof arg[Symbol.asyncIterator] === 'function';
}

function isIterable<T>(arg: any): arg is SyncOrAsyncIterable<T> {
    return isAsyncIterable(arg) || isSyncIterable(arg);
}

function isSyncIterable<T>(arg: any): arg is Iterable<T> {
    return Boolean(arg) && typeof arg[Symbol.iterator] === 'function';
}

function iteratorFromIterable<T>(
    iterable?: SyncOrAsyncIterable<T>
): SyncOrAsyncIterator<T> {
    if (isAsyncIterable(iterable)) {
        return iterable[Symbol.asyncIterator]();
    }

    return (iterable as Iterable<T>)[Symbol.iterator]();
}

function lt(a: number, b: number): boolean {
    return a < b;
}
