/**
 * Execute an action for each value yielded by the provided iterable.
 *
 * @param action    A side-effect producing function that consumes values
 *                  yielded by the provided iterable and returns nothing or a
 *                  promise that resolves to `void`.
 *
 * @returns a iterable that will yield all values yielded by the provided
 * `iterable`.
 */
export async function *tap<T>(
    action: (arg: T) => void|Promise<void>,
    iterable: Iterable<T>|AsyncIterable<T>
) {
    for await (const element of iterable) {
        await action(element);
        yield element;
    }
}
