/**
 * Yields all numbers (incrementing by `1` on each step) from 0 until `end` is
 * reached.
 *
 * @param end   The value that should serve as the upper bound of the range. It
 *              will not be included in the returned range.
 */
export function range(end: number): IterableIterator<number>;

/**
 * Yields all numbers (incrementing by `1` on each step) from `start` until
 * `end` is reached.
 *
 * @param start The value with which to begin the range.
 * @param end   The value that should serve as the upper bound of the range. It
 *              will not be included in the returned range.
 */
export function range(start: number, end: number): IterableIterator<number>;

/**
 * Yields all numbers (incrementing by `step` after each yield) from `start`
 * until `end` is reached.
 *
 * @param start The value with which to begin the range.
 * @param end   The value that should serve as the upper bound of the range. It
 *              will not be included in the returned range.
 * @param step  Difference between each number in the sequence.
 */
export function range(
    start: number,
    end: number,
    step: number
): IterableIterator<number>;

export function *range(
    startOrEnd: number,
    end?: number,
    step?: number
) {
    let start: number = startOrEnd;
    if (end === undefined) {
        start = 0;
        end = startOrEnd;
    }

    if (step === undefined) {
        step = 1;
    }

    const comparator = step > 0 ? lt : gt;
    while (comparator(start, end)) {
        yield start;
        start += step;
    }
}

function gt(a: number, b: number): boolean {
    return a > b;
}

function lt(a: number, b: number): boolean {
    return a < b;
}
