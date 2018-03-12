import { isAsyncIterable } from './isIterable';

/**
 * @returns the sum of all values yielded by the provided `iterable`.
 */
export async function sum(
    iterable: Iterable<number>|AsyncIterable<number>
): Promise<number> {
    if (isAsyncIterable(iterable)) {
        return sumAsync(iterable);
    }

    return sumSync(iterable);
}

export function sumSync(iterable: Iterable<number>): number {
    let sum = 0;
    for (const element of iterable) {
        sum += element;
    }

    return sum;
}

async function sumAsync(iterable: AsyncIterable<number>): Promise<number> {
    let sum = 0
    for (
        let iterator = iterable[Symbol.asyncIterator](),
            next = await iterator.next();
        !next.done;
        next = await iterator.next()
    ) {
        sum += next.value;
    }

    return sum;
}
