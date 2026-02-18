import { useEffect, useMemo, useRef } from "react";

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  readonly pending: boolean;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait = 300,
  immediate = false
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T> | null = null;

  const invoke = () => {
    if (!lastArgs) {
      return;
    }

    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  };

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    lastArgs = args;
    lastThis = this;

    const shouldCallImmediately = immediate && timeoutId === null;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;

      if (!immediate) {
        invoke();
      }
    }, wait);

    if (shouldCallImmediately) {
      invoke();
    }
  } as DebouncedFunction<T>;

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    invoke();
  };

  Object.defineProperty(debounced, "pending", {
    get: () => timeoutId !== null,
  });

  return debounced;
}

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait = 300,
  immediate = false
): DebouncedFunction<T> {
  const latestFnRef = useRef(fn);

  useEffect(() => {
    latestFnRef.current = fn;
  }, [fn]);

  const debounced = useMemo(
    () =>
      debounce(
        (...args: unknown[]) => {
          latestFnRef.current(...(args as Parameters<T>));
        },
        wait,
        immediate
      ),
    [wait, immediate]
  );

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  return debounced as DebouncedFunction<T>;
}
