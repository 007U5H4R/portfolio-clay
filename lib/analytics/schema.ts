/**
 * A tiny property-schema DSL for the analytics event catalogue (TASK-194). Deliberately not zod: the
 * catalogue is imported by the lazy analytics chunk, and a dependency-free validator keeps it small.
 *
 * Every property is one of four kinds, and strings are always bounded, so a component cannot smuggle a
 * free-text value (a question, a name, a URL) through an event: an `enum` accepts a closed list, a `slug`
 * accepts only `[a-z0-9_.-]` up to a length, an `int` is a bounded integer, a `bool` is a boolean.
 */
export type PropSpec =
  | { readonly kind: "enum"; readonly values: readonly string[]; readonly optional?: true }
  | { readonly kind: "slug"; readonly max: number; readonly optional?: true }
  | { readonly kind: "path"; readonly max: number; readonly optional?: true }
  | { readonly kind: "int"; readonly min: number; readonly max: number; readonly optional?: true }
  | { readonly kind: "bool"; readonly optional?: true };

export type Schema = Readonly<Record<string, PropSpec>>;

export const oneOf = <const V extends readonly string[]>(...values: V) => ({ kind: "enum", values }) as const;
export const optEnum = <const V extends readonly string[]>(...values: V) => ({ kind: "enum", values, optional: true }) as const;
export const slug = (max = 60) => ({ kind: "slug", max }) as const;
export const optSlug = (max = 60) => ({ kind: "slug", max, optional: true }) as const;
/** A site path such as `/work/teachspark`: leading slash, then `[a-z0-9/_.-]` only (no query, no fragment, no host). */
export const path = (max = 120) => ({ kind: "path", max }) as const;
export const int = (min = 0, max = 1_000_000) => ({ kind: "int", min, max }) as const;
export const optInt = (min = 0, max = 1_000_000) => ({ kind: "int", min, max, optional: true }) as const;
export const bool = () => ({ kind: "bool" }) as const;

type Opt<S> = S extends { optional: true } ? true : false;
type ValueOf<S> = S extends { kind: "enum"; values: infer V extends readonly string[] }
  ? V[number]
  : S extends { kind: "slug" | "path" }
    ? string
    : S extends { kind: "int" }
      ? number
      : S extends { kind: "bool" }
        ? boolean
        : never;

/** The TypeScript shape of a schema: required keys required, `optional` keys optional. */
export type PropsOf<T extends Schema> = {
  [K in keyof T as Opt<T[K]> extends true ? never : K]: ValueOf<T[K]>;
} & {
  [K in keyof T as Opt<T[K]> extends true ? K : never]?: ValueOf<T[K]>;
};

const SLUG = /^[a-z0-9][a-z0-9_.-]*$/;
const PATH = /^\/[a-z0-9/_.-]*$/;

export interface Validation {
  ok: boolean;
  errors: string[];
  /** Only the schema's own keys, already type-checked. Absent when `ok` is false. */
  props: Record<string, string | number | boolean>;
}

/** Check `input` against `schema`: required keys present, no unknown keys, every value in range. */
export function validateProps(schema: Schema, input: Readonly<Record<string, unknown>>): Validation {
  const errors: string[] = [];
  const props: Record<string, string | number | boolean> = {};
  for (const key of Object.keys(input)) {
    if (!(key in schema)) errors.push(`unknown property "${key}"`);
  }
  for (const [key, spec] of Object.entries(schema)) {
    const value = input[key];
    if (value === undefined) {
      if (!spec.optional) errors.push(`missing required property "${key}"`);
      continue;
    }
    switch (spec.kind) {
      case "enum":
        if (typeof value === "string" && spec.values.includes(value)) props[key] = value;
        else errors.push(`"${key}" must be one of ${spec.values.join("|")}`);
        break;
      case "slug":
        if (typeof value === "string" && value.length <= spec.max && SLUG.test(value)) props[key] = value;
        else errors.push(`"${key}" must be a slug of at most ${spec.max} characters`);
        break;
      case "path":
        if (typeof value === "string" && value.length <= spec.max && PATH.test(value) && !value.includes("//")) props[key] = value;
        else errors.push(`"${key}" must be a site path of at most ${spec.max} characters`);
        break;
      case "int":
        if (typeof value === "number" && Number.isInteger(value) && value >= spec.min && value <= spec.max) props[key] = value;
        else errors.push(`"${key}" must be an integer in ${spec.min}..${spec.max}`);
        break;
      case "bool":
        if (typeof value === "boolean") props[key] = value;
        else errors.push(`"${key}" must be a boolean`);
        break;
    }
  }
  return { ok: errors.length === 0, errors, props: errors.length === 0 ? props : {} };
}
