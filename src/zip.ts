import { iteratorFromIterable } from './iteratorFromIterable';

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
