export type MaybeArray<T> = T | T[];
export type Selector = string | Element | Document | Window | ArrayLike<Element> | NodeListOf<Element> | null | undefined;
export type CSSValue = string | number;
export type CSSInput = Record<string, CSSValue | null | undefined>;
export type AttrValue = string | null | undefined;
export type EventTargetish = Element | Document | Window;
export type Handler<E = Event> = (ev: E, el: Element, idx: number) => void | boolean;
