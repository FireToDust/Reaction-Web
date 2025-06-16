/**
 * Asserts `condition` is true. Otherwise, throws an `Error` with the provided message.
 */
export function assert(
    condition: boolean,
    msg?: string | (() => string)
  ): asserts condition {
    if (!condition) {
      throw new Error(msg ? (typeof msg === 'string' ? msg : msg()) : 'Assertion failed');
    }
  }

/** If the argument is an Error, throw it. Otherwise, pass it back. */
export function assertOK<T>(value: Error | T): T {
if (value instanceof Error) {
    throw value;
}
return value;
}

/**
 * Assert this code is unreachable. Unconditionally throws an `Error`.
 */
export function unreachable(msg?: string): never {
throw new Error(msg);
}

/**
 * Select a random element from an array
 * @param arr - Array of choices to select from
 * @returns A random element from the choices array
 */
export function randomChoice<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("Cannot select from empty array");
  }
  return arr[Math.floor(arr.length * Math.random())]!;
}