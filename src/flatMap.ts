import { flatten } from './flatten';
import { map } from './map';

/**
 * Maps each element yielded by the supplied iterable and flattens the result.
 *
 * This method will not flatten yielded strings into characters.
 *
 * @param f         The function to apply to every value yielded by the supplied
 *                  iterable.
 */
export function flatMap<T, R>(
    f: (arg: T) => R|Iterable<R>|AsyncIterable<R>,
    iterable: Iterable<T>|AsyncIterable<T>
): AsyncIterableIterator<R> {
    return flatten(map<T, R|Iterable<R>|AsyncIterable<R>>(f, iterable));
}
