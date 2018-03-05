/**
 * Creates an asynchronous iterable of all but the first items in the provided
 * iterable for which the provided predicate returns true. Once the predicate
 * returns `false`, all subsequent values will be yielded.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function *skipWhile<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    let satisfied = true;
    for await (const element of iterable) {
        if (!satisfied || !(satisfied = await predicate(element))) {
            yield element;
        }
    }
}
