declare module "node:assert" {
  export const strict: {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    strictEqual(actual: unknown, expected: unknown, message?: string): void;
    deepStrictEqual(actual: unknown, expected: unknown, message?: string): void;
  };
}

declare module "node:test" {
  export type TestFn = (t?: unknown) => unknown | Promise<unknown>;
  export function test(name: string, fn: TestFn): void;
  export function test(fn: TestFn): void;
}
