/**
 * Determines if any of the values yielded by the supplied iterator are equal to
 * (`===`) a particular value.
 *
 * @param searchElement The value against which all yielded values will be
 *                      compared
 */
export async function includes<T>(
    searchElement: T,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    for await (const element of iterable) {
        if (element === searchElement) {
            return true;
        }
    }

    return false;
}
