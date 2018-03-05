/**
 * Creates an infinite, lazy iterator that will yield the same value until
 * iteration is stopped.
 *
 * @param toRepeat  The value to yield repeatedly.
 */
export function *repeat<T>(toRepeat: T) {
    while (true) {
        yield toRepeat;
    }
}
