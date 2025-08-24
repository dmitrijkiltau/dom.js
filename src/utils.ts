export const toArray = <T>(x: ArrayLike<T> | T[] | null | undefined): T[] => x ? Array.from(x as any) : [];
export const isString = (v: unknown): v is string => typeof v === 'string';
export const isElement = (v: unknown): v is Element => v instanceof Element;
export const isWindow = (v: unknown): v is Window => v instanceof Window;
export const isDocument = (v: unknown): v is Document => v instanceof Document;
export const camelToKebab = (s: string) => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
export const kebabToCamel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
export const ensureArray = <T>(v: T | T[]): T[] => Array.isArray(v) ? v : [v];
