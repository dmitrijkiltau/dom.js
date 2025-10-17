// Generic helpers
export type MaybeArray<T> = T | T[];

// Generic selector supporting typed Elements
export type Selector<T extends Element = Element> =
  | string
  | T
  | ArrayLike<T>
  | NodeListOf<T>
  | Document
  | Window
  | null
  | undefined;

export type CSSValue = string | number;
export type CSSInput = Record<string, CSSValue | null | undefined>;
export type AttrValue = string | null | undefined;

export type EventTargetish = Element | Document | Window;

// Event map utilities
export type EventMapFor<T> =
  T extends Window ? WindowEventMap
    : T extends Document ? DocumentEventMap
    : T extends Element ? GlobalEventHandlersEventMap
    : Record<string, Event>;

export type EventFromName<TTarget, TName extends string> =
  TName extends keyof EventMapFor<TTarget> ? EventMapFor<TTarget>[TName] : Event;

// Custom event typing augmentation point
// Consumers can augment this interface via module augmentation to strongly type
// custom event names to their `detail` payloads, e.g.:
//
// declare module '@klt/dom-js' {
//   interface CustomEventMap {
//     'user:login': { id: string };
//   }
// }
export interface CustomEventMap {}

// Map a target + event name to a typed Event including custom events
export type TypedEvent<TTarget, K extends string> =
  K extends keyof EventMapFor<TTarget> ? EventMapFor<TTarget>[K]
  : K extends keyof CustomEventMap ? CustomEvent<CustomEventMap[K]>
  : Event;

// Handler with typed Event and Element
/**
 * Event handler function used by DOMCollection and helpers.
 *
 * - Ev: specific DOM Event type (e.g. MouseEvent for 'click')
 * - El: element the handler operates on (bound element for direct handlers,
 *        matched descendant for delegated handlers)
 */
export type Handler<Ev extends Event = Event, El extends Element = Element> =
  (ev: Ev, el: El, idx: number) => void | boolean;

// Convenience: map event name to handler type for an Element
export type ElementHandler<K extends string, El extends Element = Element> =
  Handler<K extends keyof GlobalEventHandlersEventMap ? GlobalEventHandlersEventMap[K] : Event, El>;

// Public API surface for module augmentation (plugins can extend this)
// Consumers may augment this interface via `declare module '@klt/dom-js' { interface Dom { ... } }`
/**
 * Public API surface for the default export. This is intentionally empty here
 * and is merged with the actual callable + properties in `src/index.ts`.
 *
 * Plugin authors can augment this interface to add custom API surface:
 *
 * declare module '@klt/dom-js' {
 *   interface Dom {
 *     flash(selector: string): Promise<DOMCollection>;
 *   }
 * }
 */
export interface Dom {} // Will be merged with actual shape in src/index.ts
