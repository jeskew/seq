/**
 * Locates the first value yielded by the supplied iterable that satisfies the
 * supplied predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function find<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    for await (const element of iterable) {
        if (await predicate(element)) {
            return element;
        }
    }

    throw new Error('No yielded value satisfied the provided condition');
}
