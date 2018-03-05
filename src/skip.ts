/**
 * Creates an asynchronous iterable of all but the first `toSkip` items in the
 * provided iterable.
 *
 * @param toSkip    The number of values from the underlying iterable to skip.
 */
export async function *skip<T>(
    toSkip: number,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    let index = 0;
    for await (const element of iterable) {
        if (++index > toSkip) {
            yield element;
        }
    }
}
