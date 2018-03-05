/**
 * Returns a lazy sequence of the first `limit` items in the provided iterable,
 * or all items if there are fewer than `limit`.
 *
 * @param limit The maximum number of items to return.
 */
export async function *take<T>(
    limit: number,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    if (limit <= 0) return;

    let i = 0;
    for await (const element of iterable) {
        yield element;
        if (++i >= limit) break;
    }
}
