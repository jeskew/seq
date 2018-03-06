/**
 * Removes duplicates from a synchronous or asynchronous iterable.
 *
 * Distinctness is evaluated by maintaining a set of previously yielded values,
 * i.e., it is evaluated via the [`SameValueZero` algorithm](http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * described in the ECMAScript 2015 specification.
 */
export async function *distinct<T>(iterable: Iterable<T>|AsyncIterable<T>) {
    const seen = new Set<T>();
    for await (const element of iterable) {
        if (!seen.has(element)) {
            yield element;
            seen.add(element);
        }
    }
}
