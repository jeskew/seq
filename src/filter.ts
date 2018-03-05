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
    iterable: Iterable<T>|AsyncIterable<T>
) {
    for await (const element of iterable) {
        if (await predicate(element)) {
            yield element;
        }
    }
}
