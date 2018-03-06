import { flatten } from './flatten';

/**
 * Combines zero or more synchronous or asynchronous iterables into a single
 * async iterable. The resulting iterable will yield all values from the first
 * iterable provided, followed by all values yielded by the next iterable, etc.,
 * for each iterable provided as an argument.
 */
export function concat<T>(...iterables: Array<Iterable<T>|AsyncIterable<T>>) {
    return flatten(iterables);
}
