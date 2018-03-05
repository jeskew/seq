/**
 * Determines whether all items yielded by an iterable satisfy the supplied
 * predicate.
 *
 * @param predicate A function that takes an element yielded by the provided
 *                  iterable and returns a boolean or a promise that resolves to
 *                  a boolean.
 */
export async function every<T>(
    predicate: (arg: T) => boolean|Promise<boolean>,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    for await (const element of iterable) {
        if (!(await predicate(element))) {
            return false;
        }
    }

    return true;
}
