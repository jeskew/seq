/**
 * @returns the sum of all values yielded by the provided `iterable`.
 */
export async function sum(
    iterable: Iterable<number>|AsyncIterable<number>
): Promise<number> {
    let sum = 0;
    for await (const element of iterable) {
        sum += element;
    }

    return sum;
}
