// ——— HTTP wrapper module (enhanced) ———

import { toQueryString } from './forms';

// ——— Types ———
export type QueryParams = Record<string, any>;

export type RetryOptions = {
  retries?: number;           // total attempts = retries + 1
  retryDelay?: number;        // initial delay ms
  retryBackoff?: number;      // multiplier per attempt (e.g., 2)
  retryOn?: (res: Response | null, err: unknown, attempt: number) => boolean | Promise<boolean>;
};

export type CacheOptions = {
  enabled?: boolean;
  ttl?: number; // ms
  key?: (ctx: { method: string; url: string; init: HttpInit }) => string;
};

export type HttpInit = RequestInit & RetryOptions & {
  query?: QueryParams;
  timeout?: number; // ms
  baseUrl?: string; // per-request override
  controller?: AbortController; // optional explicit controller
  throwOnError?: boolean; // per-request override
  onUploadProgress?: (p: { loaded: number; total?: number; percent?: number }) => void;
  cacheKey?: string;
  cacheTtl?: number; // overrides default ttl
  noCache?: boolean;
};

export type RequestContext = { method: string; url: string; init: HttpInit };
export type ResponseContext = { method: string; url: string; init: HttpInit; response: Response };
export type ErrorContext = { method: string; url: string; init: HttpInit; error: unknown; attempt: number };

export type Interceptors = {
  onRequest?: (ctx: RequestContext) => void | RequestContext | Promise<void | RequestContext>;
  onResponse?: (ctx: ResponseContext) => void | ResponseContext | Promise<void | ResponseContext>;
  onError?: (ctx: ErrorContext) => void | ResponseContext | Promise<void | ResponseContext>;
};

export type WrappedResponse = ReturnType<typeof wrap>;

export type HttpMethod = {
  get(url: string, init?: HttpInit): Promise<WrappedResponse>;
  post(url: string, body?: any, init?: HttpInit): Promise<WrappedResponse>;
  put(url: string, body?: any, init?: HttpInit): Promise<WrappedResponse>;
  patch(url: string, body?: any, init?: HttpInit): Promise<WrappedResponse>;
  delete(url: string, init?: HttpInit): Promise<WrappedResponse>;
  // Helpers (chainable clients)
  withTimeout(ms: number): HttpMethod;
  withHeaders(defaultHeaders: Record<string, string>): HttpMethod;
  withBaseUrl(baseUrl: string): HttpMethod;
  withQuery(defaultQuery: QueryParams): HttpMethod;
  withInterceptors(ints: Interceptors): HttpMethod;
  withRetry(opts: RetryOptions): HttpMethod;
  withCache(opts?: CacheOptions): HttpMethod;
  withThrowOnError(on?: boolean): HttpMethod;
  // Utilities
  appendQuery(url: string, params?: QueryParams): string;
  abortable(): { controller: AbortController; signal: AbortSignal };
  // Cache management (global for this client)
  cache: {
    clear(): void;
    delete(key: string): void;
    get(key: string): Response | undefined;
    set(key: string, res: Response, ttl?: number): void;
    computeKey(method: string, url: string, init: HttpInit): string;
  }
};

class HttpError extends Error {
  response: Response;
  status: number;
  url: string;
  constructor(message: string, response: Response, url: string) {
    super(message);
    this.name = 'HttpError';
    this.response = response;
    this.status = response.status;
    this.url = url;
  }
}

type ClientConfig = {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  defaultQuery?: QueryParams;
  timeout?: number;
  interceptors?: Interceptors[];
  throwOnError?: boolean;
  retry?: RetryOptions;
  cache?: CacheOptions;
};

// In-memory cache shared per client
function createCache() {
  const store = new Map<string, { expiresAt: number; response: Response }>();
  return {
    clear() { store.clear(); },
    delete(key: string) { store.delete(key); },
    get(key: string) {
      const e = store.get(key);
      if (!e) return undefined;
      if (e.expiresAt && e.expiresAt < Date.now()) { store.delete(key); return undefined; }
      return e.response;
    },
    set(key: string, res: Response, ttl?: number) {
      const expiresAt = ttl ? Date.now() + ttl : Number.MAX_SAFE_INTEGER;
      store.set(key, { expiresAt, response: res });
    }
  };
}

// ——— Public client ———
export const http: HttpMethod = createClient();

function createClient(config: ClientConfig = {}): HttpMethod {
  const cache = createCache();
  const cfg: ClientConfig = { ...config, interceptors: [...(config.interceptors || [])] };

  async function request(method: string, url: string, body?: any, init?: HttpInit): Promise<WrappedResponse> {
    const mergedInit: HttpInit = { ...(init || {}) };
    if (body !== undefined) mergedInit.body = serialize(body);
    // Merge headers
    const h = new Headers({ ...(cfg.defaultHeaders || {}) });
    if (mergedInit.headers) new Headers(mergedInit.headers).forEach((v, k) => h.set(k, v));

    // Content-Type for JSON bodies (not FormData/Blob)
    const rawBody = (mergedInit as any).body;
    if (rawBody && !(rawBody instanceof FormData) && !(rawBody instanceof Blob) && !h.has('Content-Type')) h.set('Content-Type', 'application/json');
    mergedInit.headers = h;

    // Base URL + query
    const baseUrl = mergedInit.baseUrl ?? cfg.baseUrl;
    let fullUrl = applyBaseUrl(url, baseUrl);
    const allQuery = { ...(cfg.defaultQuery || {}), ...(mergedInit.query || {}) };
    if (Object.keys(allQuery).length) fullUrl = appendQuery(fullUrl, allQuery);

    // Retry/timeout/throw flags
    const retry: RetryOptions = { ...cfg.retry, ...mergedInit };
    const timeoutMs = mergedInit.timeout ?? cfg.timeout;
    const throwOnError = mergedInit.throwOnError ?? cfg.throwOnError ?? false;

    // Upload progress wrapping
    if (mergedInit.onUploadProgress && rawBody && canStreamBody(rawBody)) {
      const { stream, total } = makeProgressStream(rawBody, mergedInit.onUploadProgress);
      mergedInit.body = stream as any;
      if (total != null && !h.has('Content-Length')) try { h.set('Content-Length', String(total)); } catch {}
      // Some environments require explicit duplex for streams
      (mergedInit as any).duplex = (mergedInit as any).duplex || 'half';
    }

    // Abort handling
    const controller = mergedInit.controller || (mergedInit.signal ? undefined : new AbortController());
    if (controller) mergedInit.signal = controller.signal;

    // Apply request interceptors (allow mutation or return a new ctx)
    let reqCtx: RequestContext = { method, url: fullUrl, init: mergedInit };
    for (const ints of (cfg.interceptors || [])) {
      if (!ints.onRequest) continue;
      const out = await ints.onRequest(reqCtx);
      if (out && typeof out === 'object') reqCtx = out as RequestContext;
    }

    // Caching pre-check
    const cacheOpts = cfg.cache || {};
    const cacheEnabled = (cacheOpts.enabled ?? false) && method === 'GET' && !mergedInit.noCache;
    const cacheKey = mergedInit.cacheKey || (cacheOpts.key ? cacheOpts.key(reqCtx) : defaultCacheKey(reqCtx));
    if (cacheEnabled) {
      const cached = cache.get(cacheKey);
      if (cached) return wrap(cloneResponse(cached), controller);
    }

    // Timeout support (applies only if we control a controller)
    let timeoutId: any = null;
    if (timeoutMs && timeoutMs > 0 && controller) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

    // Fetch with retry
    let attempt = 0;
    const maxAttempts = (retry.retries ?? 0) + 1;
    const baseDelay = retry.retryDelay ?? 250;
    const factor = retry.retryBackoff ?? 2;
    const shouldRetry = retry.retryOn || defaultShouldRetry;

    let lastError: unknown = null;
    while (attempt < maxAttempts) {
      try {
        const res = await fetch(reqCtx.url, { ...reqCtx.init, method: reqCtx.method });
        // Post-response interceptors (allow response replacement)
        let resCtx: ResponseContext = { method: reqCtx.method, url: reqCtx.url, init: reqCtx.init, response: res };
        for (const ints of (cfg.interceptors || [])) {
          if (!ints.onResponse) continue;
          const out = await ints.onResponse(resCtx);
          if (out && typeof out === 'object') resCtx = out as ResponseContext;
        }

        // Throw or return
        if (!resCtx.response.ok && throwOnError) {
          const err = new HttpError(`HTTP ${resCtx.response.status} for ${reqCtx.url}`, resCtx.response, reqCtx.url);
          // Allow onError interceptors
          const maybeHandled = await handleErrorInterceptors(cfg.interceptors || [], { method: reqCtx.method, url: reqCtx.url, init: reqCtx.init, error: err, attempt });
          if (maybeHandled) {
            // Interceptor returned a replacement response
            if (cacheEnabled) cache.set(cacheKey, cloneResponse(maybeHandled.response), mergedInit.cacheTtl ?? cacheOpts.ttl);
            if (timeoutId) clearTimeout(timeoutId);
            return wrap(maybeHandled.response, controller);
          }
          // Decide retry
          const retryThis = await shouldRetry(resCtx.response, null, attempt);
          if (!retryThis || attempt >= maxAttempts - 1) {
            if (timeoutId) clearTimeout(timeoutId);
            throw err;
          }
          await delay(backoffDelay(baseDelay, factor, attempt));
          attempt++;
          continue;
        }

        if (cacheEnabled) cache.set(cacheKey, cloneResponse(resCtx.response), mergedInit.cacheTtl ?? cacheOpts.ttl);
        if (timeoutId) clearTimeout(timeoutId);
        return wrap(resCtx.response, controller);
      } catch (error) {
        lastError = error;
        const ctx: ErrorContext = { method: reqCtx.method, url: reqCtx.url, init: reqCtx.init, error, attempt };
        const maybeHandled = await handleErrorInterceptors(cfg.interceptors || [], ctx);
        if (maybeHandled) {
          if (cacheEnabled) cache.set(cacheKey, cloneResponse(maybeHandled.response), mergedInit.cacheTtl ?? cacheOpts.ttl);
          if (timeoutId) clearTimeout(timeoutId);
          return wrap(maybeHandled.response, controller);
        }
        const retryThis = await shouldRetry(null, error, attempt);
        if (!retryThis || attempt >= maxAttempts - 1) {
          if (timeoutId) clearTimeout(timeoutId);
          throw error;
        }
        await delay(backoffDelay(baseDelay, factor, attempt));
        attempt++;
      }
    }
    // Should not reach here
    throw lastError || new Error('Request failed');
  }

  const client: HttpMethod = {
    async get(url: string, init?: HttpInit) { return request('GET', url, undefined, init); },
    async delete(url: string, init?: HttpInit) { return request('DELETE', url, undefined, init); },
    async post(url: string, body?: any, init?: HttpInit) { return request('POST', url, body, init); },
    async put(url: string, body?: any, init?: HttpInit) { return request('PUT', url, body, init); },
    async patch(url: string, body?: any, init?: HttpInit) { return request('PATCH', url, body, init); },

    // Chainable helpers
    withTimeout(ms: number) { return createClient({ ...cfg, timeout: ms }); },
    withHeaders(defaultHeaders: Record<string, string>) { return createClient({ ...cfg, defaultHeaders: { ...(cfg.defaultHeaders || {}), ...defaultHeaders } }); },
    withBaseUrl(baseUrl: string) { return createClient({ ...cfg, baseUrl }); },
    withQuery(defaultQuery: QueryParams) { return createClient({ ...cfg, defaultQuery: { ...(cfg.defaultQuery || {}), ...defaultQuery } }); },
    withInterceptors(ints: Interceptors) { return createClient({ ...cfg, interceptors: [...(cfg.interceptors || []), ints] }); },
    withRetry(opts: RetryOptions) { return createClient({ ...cfg, retry: { ...(cfg.retry || {}), ...opts } }); },
    withCache(opts?: CacheOptions) { return createClient({ ...cfg, cache: { ...(cfg.cache || {}), ...(opts || { enabled: true }) } }); },
    withThrowOnError(on: boolean = true) { return createClient({ ...cfg, throwOnError: on }); },

    // Utils
    appendQuery(url: string, params?: QueryParams) { return appendQuery(url, params || {}); },
    abortable() { const controller = new AbortController(); return { controller, signal: controller.signal }; },
    cache: {
      clear() { cache.clear(); },
      delete(key: string) { cache.delete(key); },
      get(key: string) { return cache.get(key); },
      set(key: string, res: Response, ttl?: number) { cache.set(key, cloneResponse(res), ttl); },
      computeKey(method: string, url: string, init: HttpInit) { return defaultCacheKey({ method, url, init }); }
    }
  } as HttpMethod;

  return client;
}

// ——— Wrap Response ———
function wrap(r: Response, controller?: AbortController) {
  const self = {
    raw: r,
    ok: r.ok,
    status: r.status,
    text: () => r.text(),
    json: <T = unknown>() => r.json() as Promise<T>,
    html: () => r.text().then(s => new DOMParser().parseFromString(s, 'text/html')),
    okOrThrow: () => { if (!r.ok) throw new HttpError(`HTTP ${r.status}`, r, (r as any).url || ''); return self; },
    controller,
    cancel: () => controller?.abort()
  };
  return self;
}

// ——— Utilities ———
function serialize(body: any) {
  if (body == null) return undefined;
  if (body instanceof FormData || typeof body === 'string' || body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return body as any;
  if (typeof body === 'object') return JSON.stringify(body);
  return String(body);
}

function applyBaseUrl(url: string, baseUrl?: string) {
  if (!baseUrl) return url;
  try {
    // If url is absolute, new URL(url) succeeds; keep as is
    new URL(url);
    return url;
  } catch {
    // Relative URL, resolve against base
    try { return new URL(url, baseUrl).toString(); }
    catch { return (baseUrl.replace(/\/$/, '')) + (url.startsWith('/') ? url : '/' + url); }
  }
}

export function appendQuery(url: string, params: QueryParams): string {
  if (!params || !Object.keys(params).length) return url;
  const q = toQueryString(params);
  if (!q) return url;
  const hasQ = url.includes('?');
  return url + (hasQ ? '&' : '?') + q;
}

function defaultCacheKey(ctx: { method: string; url: string; init: HttpInit }) {
  // Cache by method + url (+ body hash for non-GET if opted-in later)
  return `${ctx.method}:${ctx.url}`;
}

function cloneResponse(res: Response): Response {
  // Buffer response as text, then create a fresh Response for cache reuse
  // Note: We clone only when storing; here we assume body is still readable
  // but when returning from cache we create a new Response each time.
  // For safety, convert to arrayBuffer and back
  // However to avoid async complexity here, we rely on callers to pass a fresh clone
  return res.clone();
}

function defaultShouldRetry(res: Response | null, err: unknown, attempt: number): boolean {
  if (err) return true; // network error
  if (!res) return false;
  const s = res.status;
  return s >= 500 || s === 429;
}

function backoffDelay(base: number, factor: number, attempt: number) {
  return Math.round(base * Math.pow(factor, Math.max(0, attempt)));
}

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }

async function handleErrorInterceptors(ints: Interceptors[], ctx: ErrorContext): Promise<ResponseContext | null> {
  for (const i of ints) {
    if (!i.onError) continue;
    const out = await i.onError(ctx);
    if (out && typeof out === 'object' && 'response' in (out as any)) return out as ResponseContext;
  }
  return null;
}

// ——— Upload progress helpers ———
function canStreamBody(body: any): boolean {
  return typeof ReadableStream !== 'undefined' && (typeof body === 'string' || body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body));
}

function makeProgressStream(body: any, onProgress: (p: { loaded: number; total?: number; percent?: number }) => void): { stream: ReadableStream<Uint8Array>; total?: number } {
  let source: Uint8Array;
  if (typeof body === 'string') source = new TextEncoder().encode(body);
  else if (body instanceof Blob) return makeBlobProgressStream(body, onProgress);
  else if (body instanceof ArrayBuffer) source = new Uint8Array(body);
  else if (ArrayBuffer.isView(body)) source = new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  else source = new TextEncoder().encode(String(body));

  const total = source.byteLength;
  let loaded = 0;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const chunkSize = 64 * 1024;
      for (let i = 0; i < source.byteLength; i += chunkSize) controller.enqueue(source.subarray(i, Math.min(i + chunkSize, source.byteLength)));
      controller.close();
    },
    pull() {},
    cancel() {}
  }).pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      onProgress({ loaded, total, percent: total ? (loaded / total) * 100 : undefined });
      controller.enqueue(chunk);
    }
  }));
  return { stream, total };
}

function makeBlobProgressStream(blob: Blob, onProgress: (p: { loaded: number; total?: number; percent?: number }) => void): { stream: ReadableStream<Uint8Array>; total?: number } {
  const total = blob.size;
  let loaded = 0;
  const reader = blob.stream().getReader();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      loaded += value?.byteLength || 0;
      onProgress({ loaded, total, percent: total ? (loaded / total) * 100 : undefined });
      if (value) controller.enqueue(value);
    },
    cancel() { reader.cancel(); }
  });
  return { stream, total };
}
