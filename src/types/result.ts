/**
 * Result<T, E> - Discriminated union for functional error handling.
 *
 * Represents either success (Ok) or failure (Err).
 * Forces explicit error handling at the type level.
 */

/** Successful result variant */
export type Ok<T> = {
  readonly kind: "ok";
  readonly value: T;
};

/** Failed result variant */
export type Err<E> = {
  readonly kind: "err";
  readonly error: E;
};

/** Result type - either Ok<T> or Err<E> */
export type Result<T, E> = Ok<T> | Err<E>;

/** Type guard for Ok variant */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.kind === "ok";
}

/** Type guard for Err variant */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.kind === "err";
}

/** Create an Ok result */
export function ok<T>(value: T): Ok<T> {
  return { kind: "ok", value };
}

/** Create an Err result */
export function err<E>(error: E): Err<E> {
  return { kind: "err", error };
}
