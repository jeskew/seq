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
    iterable: Iterable<T>|AsyncIterable<T>
) {
    for await (const element of iterable) {
        if (await predicate(element)) {
            yield element;
        } else {
            break;
        }
    }
}
