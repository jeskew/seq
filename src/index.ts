/**
 * Provides a simple polyfill for runtime environments that provide a Symbol
 * implementation but do not have Symbol.asyncIterator available by default.
 */
if (Symbol && !Symbol.asyncIterator) {
    (Symbol as any).asyncIterator = Symbol.for("__@@asyncIterator__");
}

abstract class AsyncIterableDecorator<T> implements
    AsyncIterableIterator<T>
{
    protected readonly iterator: Iterator<T> | AsyncIterator<T>;

    constructor(iterable: Iterable<T> | AsyncIterable<T>) {
        this.iterator = iteratorFromIterable(iterable);
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    abstract next(): Promise<IteratorResult<T>>;

    async return(): Promise<IteratorResult<T>> {
        if (typeof this.iterator.return === 'function') {
            return this.iterator.return();
        }

        return { done: true } as IteratorResult<T>;
    }
}

/**
 * Collects the values yielded by a synchronous or asynchronous iterable into an
 * array.
 */
export async function collect<T>(
    iterable: Iterable<T> | AsyncIterable<T>
): Promise<Array<T>> {
    if (isSyncIterable(iterable)) {
        return [...iterable]
    }

    const iterator = iterable[Symbol.asyncIterator]();
    const collected: Array<T> = [];
    for (
        let next = await iterator.next(),
        value = next.value,
        done = next.done;
        !done;
        next = await iterator.next(),
        value = next.value,
        done = next.done
    ) {
        collected.push(value);
    }

    return collected;
}

/**
 * Combines zero or more synchronous or asynchronous iterables into a single
 * async iterable. The resulting iterable will yield all values from the first
 * iterable provided, followed by all values yielded by the next iterable, etc.,
 * for each iterable provided as an argument.
 */
export function concat<T>(...iterables: Array<Iterable<T> | AsyncIterable<T>>) {
    return flatten(iterables);
}

/**
 * Removes duplicates from a synchronous or asynchronous iterable.
 *
 * Distinctness is evaluated by maintaining a set of previously yielded values,
 * i.e., it is evaluated via the [`SameValueZero` algorithm](http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * described in the ECMAScript 2015 specification.
 */
export function distinct<T>(iterable: Iterable<T>): Iterable<T>;

export function distinct<T>(iterable: AsyncIterable<T>): AsyncIterable<T>;

export function distinct<T>(
    iterable: Iterable<T> | AsyncIterable<T>
): Iterable<T> | AsyncIterable<T>;

export function distinct<T>(
    iterable: Iterable<T> | AsyncIterable<T>
): Iterable<T> | AsyncIterable<T> {
    if (isSyncIterable(iterable)) {
        return distinctSync(iterable);
    }

    return new Deduplicator(iterable);
}

export function* distinctSync<T>(iterable: Iterable<T>): IterableIterator<T> {
    const seen = new Set<T>();
    for (const element of iterable) {
        if (!seen.has(element)) {
            yield element;
            seen.add(element);
        }
    }
}

class Deduplicator<T> extends AsyncIterableDecorator<T> {
    private readonly seen = new Set<T>();

    async next(): Promise<IteratorResult<T>> {
        const { done, value } = await this.iterator.next();
        if (done) {
            return { done, value };
        }

        if (this.seen.has(value)) {
            return this.next();
        } else {
            this.seen.add(value);
            return { done, value };
        }
    }
}

/**
 * Determines whether all items yielded by an iterable satisfy the supplied
 * predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean.
 */
export async function every<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T> | AsyncIterable<T>
): Promise<boolean> {
    if (isSyncIterable(iterable)) {
        return everySync(predicate, iterable);
    }

    return everyAsync(predicate, iterable);
}

export function everySync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
) {
    for (const element of iterable) {
        if (!predicate(element)) {
            return false;
        }
    }

    return true;
}

async function everyAsync<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
) {
    const iterator = iterable[Symbol.asyncIterator]();
    for (
        let next = await iterator.next(),
        value = next.value,
        done = next.done;
        !done;
        next = await iterator.next(),
        value = next.value,
        done = next.done
    ) {
        if (!predicate(value)) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
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
export function filter<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
): IterableIterator<T>;

export function filter<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
): AsyncIterableIterator<T>;

export function filter<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T>;

export function filter<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return filterSync(predicate, iterable);
    }

    return new FilterIterator(predicate, iterable);
}

export function* filterSync<T>(
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
        const { value, done } = await this.iterator.next();
        if (done || this.predicate(value)) {
            return { value, done };
        }

        return this.next();
    }
}

/**
 * Locates the first value yielded by the supplied iterable that satisfies the
 * supplied predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean.
 */
export async function find<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T> | AsyncIterable<T>
): Promise<T> {
    if (isSyncIterable(iterable)) {
        return findSync(predicate, iterable);
    }

    return findAsync(predicate, iterable);
}

export function findSync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
): T {
    for (const element of iterable) {
        if (predicate(element)) {
            return element;
        }
    }

    throw new Error('No yielded value satisfied the provided condition');
}

async function findAsync<T>(
    predicate: (arg: T) => boolean,
    iterable: AsyncIterable<T>
): Promise<T> {
    const iterator = iterable[Symbol.asyncIterator]();
    for (
        let next = await iterator.next(),
        value = next.value,
        done = next.done;
        !done;
        next = await iterator.next(),
        value = next.value,
        done = next.done
    ) {
        if (predicate(value)) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
            return value;
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
    f: (arg: T) => R | Iterable<R> | AsyncIterable<R>,
    iterable: Iterable<T> | AsyncIterable<T>
): AsyncIterableIterator<R> {
    return flatten(map<T, R | Iterable<R> | AsyncIterable<R>>(f, iterable));
}

/**
 * A synchronous iterable whose elements are either of type T or are themselves
 * synchronous or asynchronous iterables of an arbitrary depth.
 */
export interface RecursiveSyncIterable<T> extends
    Iterable<T | RecursiveIterable<T>> { }

/**
* An asynchronous iterable whose elements are either of type T or are
* themselves synchronous or asynchronous iterables of an arbitrary depth.
*/
export interface RecursiveAsyncIterable<T> extends
    AsyncIterable<T | RecursiveIterable<T>> { }

/**
* A synchronous or asynchronous iterable whose elements are either of type T or
* are themselves synchronous or asynchronous iterables of an arbitrary depth.
*/
export type RecursiveIterable<T> = RecursiveSyncIterable<T> | RecursiveAsyncIterable<T>;

/**
* An element yielded by an iterable that may or may not be iterable itself.
*/
export type ElementOrIterable<T> = T | Iterable<T> | AsyncIterable<T>;

/**
* Flattens an iterable that yields elements of type T or
* Iterable<T>|AsyncIterable<T> into an interable that yields elements of type
* T.
*
* This method will not flatten yielded strings into characters.
*
* @param iterable The iterable to flatten
*/
export function flatten<T>(
    iterable: Iterable<ElementOrIterable<T>> | AsyncIterable<ElementOrIterable<T>>
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
): AsyncIterableIterator<T | RecursiveIterable<T>>;

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
    iterable: Iterable<T> | AsyncIterable<T>
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
    iterable: Iterable<ElementOrIterable<T>> | AsyncIterable<ElementOrIterable<T>>
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
    iterable: Iterable<ElementOrIterable<ElementOrIterable<T>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<T>>>
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
    iterable: Iterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>
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
    iterable: Iterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>>
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
    iterable: Iterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>>> |
        AsyncIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<ElementOrIterable<T>>>>>>
): AsyncIterableIterator<T>;

export function flatten<T>(
    depthOrIterable: number | RecursiveIterable<T>,
    iterable?: RecursiveIterable<T>
): RecursiveIterable<T> {
    let depth: number;
    if (typeof depthOrIterable === 'number') {
        depth = depthOrIterable;
    } else {
        depth = 1;
        iterable = depthOrIterable;
    }

    return new FlattenIterator(depth, iterable as RecursiveIterable<T>);
}

class FlattenIterator<T> {
    private readonly iteratorStack: Array<Iterator<T> | AsyncIterator<T>> = [];

    constructor(
        private readonly depth: number,
        iterable: Iterable<T> | AsyncIterable<T>
    ) {
        this.iteratorStack.push(iteratorFromIterable(iterable));
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next(): Promise<IteratorResult<T>> {
        const { length } = this.iteratorStack;
        if (length === 0) {
            return { done: true } as IteratorResult<T>;
        }

        const { done, value } = await this.iteratorStack[length - 1].next();
        if (done) {
            this.iteratorStack.pop();
            return this.next();
        }

        if (typeof value === 'object' && this.depth >= length) {
            if (isSyncIterable<T>(value)) {
                this.iteratorStack.push(value[Symbol.iterator]());
                return this.next();
            }

            if (isAsyncIterable<T>(value)) {
                this.iteratorStack.push(value[Symbol.asyncIterator]());
                return this.next();
            }
        }

        return { done, value };
    }

    async return(): Promise<IteratorResult<T>> {
        let iterator: Iterator<T> | AsyncIterator<T> | undefined;
        while (iterator = this.iteratorStack.pop()) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
        }

        return { done: true } as IteratorResult<T>;
    }
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
    iterable: Iterable<T> | AsyncIterable<T>
) {
    return isSyncIterable(iterable)
        ? includesSync(searchElement, iterable)
        : includesAsync(searchElement, iterable);
}

export function includesSync<T>(searchElement: T, iterable: Iterable<T>) {
    for (const element of iterable) {
        if (element === searchElement) {
            return true;
        }
    }

    return false;
}

async function includesAsync<T>(searchElement: T, iterable: AsyncIterable<T>) {
    const iterator = iterable[Symbol.asyncIterator]();
    for (
        let next = await iterator.next(),
        value = next.value,
        done = next.done;
        !done;
        next = await iterator.next(),
        value = next.value,
        done = next.done
    ) {
        if (value === searchElement) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
            return true;
        }
    }

    return false;
}

/**
 * Mix zero or more synchronous or asynchronous iterables by alternating between
 * them.
 */
export function interleave<T>(
    ...iterables: Array<Iterable<T> | AsyncIterable<T>>
): AsyncIterableIterator<T> {
    return new InterleavingIterator(iterables);
}

class InterleavingIterator<T> implements AsyncIterableIterator<T> {
    private current = 0
    private readonly iterators: Array<Iterator<T> | AsyncIterator<T>> = []

    constructor(
        private readonly sourceIterables: Array<Iterable<T> | AsyncIterable<T>>
    ) { }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next(): Promise<IteratorResult<T>> {
        if (this.sourceIterables.length > 0) {
            this.iterators.push(iteratorFromIterable(
                this.sourceIterables.shift() as Iterable<T> | AsyncIterable<T>
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
        let iterator: Iterator<T> | AsyncIterator<T> | undefined;
        while (iterator = this.iterators.pop()) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }
        }

        return { done: true } as IteratorResult<T>;
    }
}

/**
 * Determines if the provided value adheres to the AsyncIterable protocol.
 *
 * @param arg Any value
 */
export function isAsyncIterable<T>(arg: any): arg is AsyncIterable<T> {
    return Boolean(arg) && typeof arg[Symbol.asyncIterator] === 'function';
}

/**
 * Determines if the provided value adheres to Iterable protocol.
 *
 * @param arg Any value
 */
export function isSyncIterable<T>(arg: any): arg is Iterable<T> {
    return Boolean(arg) && typeof arg[Symbol.iterator] === 'function';
}

/**
 * Extracts the underlying synchronous or asynchronous iterator from a
 * synchronous or asynchronous iterable, respectively.
 *
 * If the provided value adheres to both the Iterable and AsyncIterable
 * protocols, its asynchronous interface will be used.
 *
 * @param iterable A synchronous or asynchronous iterable.
 */
export function iteratorFromIterable<T>(
    iterable: Iterable<T> | AsyncIterable<T>
): Iterator<T> | AsyncIterator<T> {
    if (isAsyncIterable(iterable)) {
        return iterable[Symbol.asyncIterator]();
    }

    return iterable[Symbol.iterator]();
}

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
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<R> | AsyncIterableIterator<R>;

export function map<T, R>(
    f: (arg: T) => R,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<R> | AsyncIterableIterator<R> {
    if (isSyncIterable(iterable)) {
        return mapSync(f, iterable);
    }

    return new MapIterator(f, iterable);
}

export function* mapSync<T, R>(f: (arg: T) => R, iterable: Iterable<T>) {
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

    async next(): Promise<IteratorResult<R>> {
        const { done, value } = await this.iterator.next();
        if (done) {
            return { done } as IteratorResult<R>;
        }

        return { done, value: this.f(value as any) };
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
export function merge<T>(
    ...iterables: Array<Iterable<T> | AsyncIterable<T>>
): AsyncIterableIterator<T> {
    return new MergeIterator(iterables);
}

class MergeIterator<T> implements AsyncIterableIterator<T> {
    private readonly pending: Array<[
        Iterator<T> | AsyncIterator<T>,
        Promise<IteratorResult<Iterator<T> | AsyncIterator<T>>>
    ]> = [];
    private readonly resolved: Array<T> = [];

    constructor(iterables: Iterable<Iterable<T> | AsyncIterable<T>>) {
        for (const iterable of iterables) {
            this.refillPending(iteratorFromIterable(iterable));
        }
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next(): Promise<IteratorResult<T>> {
        if (this.resolved.length > 0) {
            return { done: false, value: this.resolved.shift() as T };
        }

        if (this.pending.length === 0) {
            return { done: true } as IteratorResult<T>;
        }

        const { done, value } = await Promise.race(
            mapSync(pair => pair[1], this.pending)
        );

        for (let i = this.pending.length - 1; i >= 0; i--) {
            if (this.pending[i][0] === value) {
                this.pending.splice(i, 1);
            }
        }

        if (!done) {
            this.refillPending(value);
        }

        return this.next();
    }

    async return(): Promise<IteratorResult<T>> {
        await Promise.all(returnIterators(
            mapSync(pair => pair[0], this.pending)
        ));
        this.pending.length = 0;

        return { done: true } as IteratorResult<T>;
    }

    private refillPending(iterator: Iterator<T> | AsyncIterator<T>) {
        this.pending.push([
            iterator,
            Promise.resolve(iterator.next()).then(
                ({ done, value }) => {
                    if (!done) {
                        this.resolved.push(value);
                    }
                    return { done, value: iterator };
                },
                err => {
                    const returnErr = () => Promise.reject(err);
                    return Promise.all(returnIterators(filterSync(
                        iter => iter !== iterator,
                        mapSync(pair => pair[0], this.pending)
                    ))).then(returnErr, returnErr);
                }
            )
        ]);
    }
}

function returnIterators(
    iterators: Iterable<Iterator<any> | AsyncIterator<any>>
): Iterable<Promise<void | IteratorResult<any>>> {
    return mapSync(
        async (iterator): Promise<void | IteratorResult<any>> => {
            if (typeof iterator.return === 'function') {
                return iterator.return();
            }
        },
        iterators
    );
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

export function* range(
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

function gt(a: number, b: number): boolean {
    return a > b;
}

function lt(a: number, b: number): boolean {
    return a < b;
}

/**
 * Reduces an iterable to a single value by applying the provided `reducer`
 * function against an accumulator and each element yielded by the iterable (in
 * the order in which they are received).
 *
 * The first invocation of the reducer will receive the first value yielded by
 * the underlying iterable as its accumulator and the second value yielded as
 * its currentValue argument.
 */
export function reduce<T>(
    reducer: (accumulator: T, currentValue: T) => T,
    iterable: Iterable<T> | AsyncIterable<T>
): Promise<T>;

/**
 * Reduces an iterable to a single value by applying the provided `reducer`
 * function against an accumulator and each element yielded by the iterable (in
 * the order in which they are received).
 *
 * @param initialValue  The value to use as the accumulator on the first
 *                      invocation of the reducer function.
 */
export function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R,
    initialValue: R,
    iterable: Iterable<T> | AsyncIterable<T>
): Promise<R>;

export async function reduce<T, R>(
    reducer: (accumulator: R, currentValue: T) => R,
    iterableOrInitialValue: R | Iterable<T> | AsyncIterable<T>,
    iterable?: Iterable<T> | AsyncIterable<T>
) {
    if (!iterable) {
        return isSyncIterable(iterableOrInitialValue)
            ? reduceSync(reducer as any, iterableOrInitialValue)
            : reduceAsync(reducer, iterableOrInitialValue);
    }

    return isSyncIterable(iterable)
        ? reduceSync(reducer, iterableOrInitialValue as R, iterable)
        : reduceAsync(reducer, iterableOrInitialValue as R, iterable);
}

export function reduceSync<T>(
    reducer: (accumulator: T, currentValue: T) => T,
    iterable: Iterable<T>
): T;

export function reduceSync<T, R>(
    reducer: (accumulator: R, currentValue: T) => R,
    initialValue: R,
    iterable: Iterable<T>
): R;

export function reduceSync<T, R>(
    reducer: (accumulator: R, currentValue: T) => R,
    iterableOrInitialValue: R | Iterable<T>,
    iterable?: Iterable<T>
) {
    let value: R = iterableOrInitialValue as R;
    let initialized = true;
    if (!iterable) {
        iterable = iterableOrInitialValue as Iterable<T>;
        initialized = false;
    }

    for (const element of iterable) {
        if (initialized) {
            value = reducer(value, element);
        } else {
            value = <R><any>element;
            initialized = true;
        }
    }

    return value;
}

async function reduceAsync<T, R>(
    reducer: (accumulator: R, currentValue: T) => R,
    iterableOrInitialValue: R | Iterable<T> | AsyncIterable<T>,
    iterable?: Iterable<T> | AsyncIterable<T>
) {
    let value: R = iterableOrInitialValue as R;
    let initialized = true;
    if (!iterable) {
        iterable = iterableOrInitialValue as Iterable<T> | AsyncIterable<T>;
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
            value = reducer(value, element);
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
export function* repeat<T>(toRepeat: T) {
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
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T>;

export function skip<T>(
    toSkip: number,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return skipSync(toSkip, iterable);
    }

    return new SkipIterator(toSkip, iterable);
}

export function* skipSync<T>(toSkip: number, iterable: Iterable<T>) {
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
        const { value, done } = await this.iterator.next();
        if (done) {
            return { done, value };
        }

        if (++this.index > this.toSkip) {
            return { done, value };
        }

        return this.next();
    }
}

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
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T>;

export function skipWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return skipWhileSync(predicate, iterable);
    }

    return new SkipWhileIterator(predicate, iterable);
}

export function* skipWhileSync<T>(
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
        const { value, done } = await this.iterator.next();
        if (done) {
            return { done, value };
        }

        if (!this.satisfied || !(this.satisfied = await this.predicate(value))) {
            return { done, value };
        }

        return this.next();
    }
}

/**
 * Determines if any value yielded by the provided iterable satisfies the
 * provided predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean.
 */
export async function some<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T> | AsyncIterable<T>
) {
    if (isSyncIterable(iterable)) {
        return someSync(predicate, iterable);
    }

    for (
        let iterator = iterable[Symbol.asyncIterator](),
        next = await iterator.next(),
        element = next.value,
        done = next.done;
        !done;
        next = await iterator.next(),
        element = next.value,
        done = next.done
    ) {
        if (predicate(element)) {
            if (typeof iterator.return === 'function') {
                await iterator.return();
            }

            return true;
        }
    }

    return false;
}

export function someSync<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T>
) {
    for (const element of iterable) {
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
    iterable: Iterable<number> | AsyncIterable<number>
): Promise<number> {
    if (isAsyncIterable(iterable)) {
        return sumAsync(iterable);
    }

    return sumSync(iterable);
}

export function sumSync(iterable: Iterable<number>): number {
    let sum = 0;
    for (const element of iterable) {
        sum += element;
    }

    return sum;
}

async function sumAsync(iterable: AsyncIterable<number>): Promise<number> {
    let sum = 0
    for (
        let iterator = iterable[Symbol.asyncIterator](),
        next = await iterator.next();
        !next.done;
        next = await iterator.next()
    ) {
        sum += next.value;
    }

    return sum;
}

/**
 * Returns a lazy sequence of the first `limit` items in the provided iterable,
 * or all items if there are fewer than `limit`.
 *
 * @param limit The maximum number of items to return.
 */
export function take<T>(
    limit: number,
    iterable: AsyncIterable<T>
): AsyncIterableIterator<T>;

export function take<T>(
    limit: number,
    iterable: Iterable<T>
): IterableIterator<T>;

export function take<T>(
    limit: number,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T>;

export function take<T>(
    limit: number,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return takeSync(limit, iterable);
    }

    return new TakeIterator(limit, iterable);
}

export function* takeSync<T>(
    limit: number,
    iterable: Iterable<T>
): IterableIterator<T> {
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
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T>;

export function takeWhile<T>(
    predicate: (arg: T) => boolean,
    iterable: Iterable<T> | AsyncIterable<T>
): IterableIterator<T> | AsyncIterableIterator<T> {
    if (isSyncIterable(iterable)) {
        return takeWhileSync(predicate, iterable);
    }

    return new TakeWhileIterator(predicate, iterable);
}

export function* takeWhileSync<T>(
    predicate: (arg: T) => boolean | Promise<boolean>,
    iterable: Iterable<T>
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

        const { value, done } = await this.iterator.next();
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
export function tap<T>(
    action: (arg: T) => void | Promise<void>,
    iterable: Iterable<T> | AsyncIterable<T>
): AsyncIterableIterator<T> {
    return new TapIterator(action, iterable);
}

class TapIterator<T> extends AsyncIterableDecorator<T> {
    constructor(
        private readonly action: (arg: T) => void | Promise<void>,
        iterable: Iterable<T> | AsyncIterable<T>
    ) {
        super(iterable);
    }

    async next() {
        const { done, value } = await this.iterator.next();
        if (!done) {
            await this.action(value);
        }

        return { done, value };
    }
}

/**
 * Creates an iterable of tuple pairs that matches the iteration signature of
 * an ES6 Map object.
 *
 * If the two provided iterables are different lengths, the resulting iterable
 * will be the same length as the shorter of the two. The longer iterable will
 * be terminated early.
 *
 * @param keys      The values to use as the first member of each pair.
 * @param values    The values to use as the second member of each pair.
 */
export function zip<K, V>(
    keys: Iterable<K>,
    values: Iterable<V>
): IterableIterator<[K, V]>;

export function zip<K, V>(
    keys: Iterable<K> | AsyncIterable<K>,
    values: Iterable<V> | AsyncIterable<V>
): AsyncIterableIterator<[K, V]>;

export function zip<K, V>(
    keys: AsyncIterable<K> | Iterable<K>,
    values: AsyncIterable<V> | Iterable<V>
): IterableIterator<[K, V]> | AsyncIterableIterator<[K, V]> {
    if (isSyncIterable(keys) && isSyncIterable(values)) {
        return zipSync(keys, values);
    }

    return new ZipIterator(keys, values);
}

export function* zipSync<K, V>(
    keys: Iterable<K>,
    values: Iterable<V>
): IterableIterator<[K, V]> {
    const keyIterator = keys[Symbol.iterator]();
    const valueIterator = values[Symbol.iterator]();

    while (true) {
        const { done: keysDone, value: key } = keyIterator.next();
        const { done: valuesDone, value } = valueIterator.next();

        if (keysDone) {
            if (!valuesDone && typeof valueIterator.return === 'function') {
                return valueIterator.return();
            }

            break;
        }

        if (valuesDone) {
            if (!keysDone && typeof keyIterator.return === 'function') {
                return keyIterator.return();
            }

            break;
        }

        yield [key, value];
    }
}

class ZipIterator<K, V> implements AsyncIterableIterator<[K, V]> {
    private readonly keys: Iterator<K> | AsyncIterator<K>;
    private keysDone = false
    private readonly values: Iterator<V> | AsyncIterator<V>;
    private valuesDone = false

    constructor(
        keys: Iterable<K> | AsyncIterable<K>,
        values: Iterable<V> | AsyncIterable<V>
    ) {
        this.keys = iteratorFromIterable(keys);
        this.values = iteratorFromIterable(values);
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next() {
        const { done: keysDone, value: key } = await this.keys.next();
        const { done: valuesDone, value } = await this.values.next();

        if ((this.keysDone = keysDone ?? false) || (this.valuesDone = valuesDone ?? false)) {
            return this.return();
        }

        return { done: false, value: [key, value] as [K, V] };
    }

    async return() {
        await Promise.all([
            !this.keysDone && typeof this.keys.return === 'function' ?
                this.keys.return() : Promise.resolve(),
            !this.valuesDone && typeof this.values.return === 'function' ?
                this.values.return() : Promise.resolve(),
        ] as Array<Promise<any>>);

        return { done: true } as IteratorResult<[K, V]>;
    }
}
