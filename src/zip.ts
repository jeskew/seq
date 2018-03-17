import { iteratorFromIterable } from './iteratorFromIterable';
import { isSyncIterable } from './isIterable';

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
    keys: Iterable<K>|AsyncIterable<K>,
    values: Iterable<V>|AsyncIterable<V>
): AsyncIterableIterator<[K, V]>;

export function zip<K, V>(
    keys: AsyncIterable<K>|Iterable<K>,
    values: AsyncIterable<V>|Iterable<V>
): IterableIterator<[K, V]>|AsyncIterableIterator<[K, V]> {
    if (isSyncIterable(keys) && isSyncIterable(values)) {
        return zipSync(keys, values);
    }

    return new ZipIterator(keys, values);
}

export function *zipSync<K, V>(
    keys: Iterable<K>,
    values: Iterable<V>
): IterableIterator<[K, V]> {
    const keyIterator = keys[Symbol.iterator]();
    const valueIterator = values[Symbol.iterator]();

    while (true) {
        const {done: keysDone, value: key} = keyIterator.next();
        const {done: valuesDone, value} = valueIterator.next();

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
    private readonly keys: Iterator<K>|AsyncIterator<K>;
    private keysDone = false
    private readonly values: Iterator<V>|AsyncIterator<V>;
    private valuesDone = false

    constructor(
        keys: Iterable<K>|AsyncIterable<K>,
        values: Iterable<V>|AsyncIterable<V>
    ) {
        this.keys = iteratorFromIterable(keys);
        this.values = iteratorFromIterable(values);
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    async next() {
        const {done: keysDone, value: key} = await this.keys.next();
        const {done: valuesDone, value} = await this.values.next();

        if ((this.keysDone = keysDone) || (this.valuesDone = valuesDone)) {
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
