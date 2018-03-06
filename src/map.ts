/**
 * Transforms each value yielded by the supplied iterable by calling the
 * supplied and returning the result.
 *
 * @param f The function to call with each value yielded by the provided
 *          iterable.
 */
export async function *map<T, R>(
    f: (arg: T) => R,
    iterable: Iterable<T>|AsyncIterable<T>
): AsyncIterableIterator<R> {
    for await (const element of iterable) {
        yield f(element);
    }
}
