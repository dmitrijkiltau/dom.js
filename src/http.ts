// ——— HTTP wrapper module ———

export type HttpMethod = {
  get(url: string, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  post(url: string, body?: any, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  put(url: string, body?: any, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  patch(url: string, body?: any, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  delete(url: string, init?: RequestInit): Promise<ReturnType<typeof wrap>>;
  withTimeout(ms: number): HttpMethod;
  withHeaders(defaultHeaders: Record<string, string>): HttpMethod;
};

export const http: HttpMethod = {
  async get(url: string, init?: RequestInit) { 
    const r = await fetch(url, { method: 'GET', ...init }); 
    return wrap(r); 
  },
  async post(url: string, body?: any, init?: RequestInit) { 
    const r = await fetch(url, { 
      method: 'POST', 
      body: serialize(body), 
      headers: headers(init, body), 
      ...init 
    }); 
    return wrap(r); 
  },
  async put(url: string, body?: any, init?: RequestInit) { 
    const r = await fetch(url, { 
      method: 'PUT', 
      body: serialize(body), 
      headers: headers(init, body), 
      ...init 
    }); 
    return wrap(r); 
  },
  async patch(url: string, body?: any, init?: RequestInit) { 
    const r = await fetch(url, { 
      method: 'PATCH', 
      body: serialize(body), 
      headers: headers(init, body), 
      ...init 
    }); 
    return wrap(r); 
  },
  async delete(url: string, init?: RequestInit) { 
    const r = await fetch(url, { method: 'DELETE', ...init }); 
    return wrap(r); 
  },
  
  // Request helpers
  withTimeout(ms: number): HttpMethod {
    const timeoutHttp = {} as any;
    for (const [method, fn] of Object.entries(http)) {
      if (typeof fn === 'function' && method !== 'withTimeout' && method !== 'withHeaders') {
        timeoutHttp[method] = async (...args: any[]) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), ms);
          try {
            const init = args[args.length - 1] || {};
            args[args.length - 1] = { ...init, signal: controller.signal };
            return await (fn as any).apply(null, args);
          } finally {
            clearTimeout(timeoutId);
          }
        };
      }
    }
    timeoutHttp.withTimeout = http.withTimeout;
    timeoutHttp.withHeaders = http.withHeaders;
    return timeoutHttp;
  },
  
  withHeaders(defaultHeaders: Record<string, string>): HttpMethod {
    const headersHttp = {} as any;
    for (const [method, fn] of Object.entries(http)) {
      if (typeof fn === 'function' && method !== 'withTimeout' && method !== 'withHeaders') {
        headersHttp[method] = async (...args: any[]) => {
          const init = args[args.length - 1] || {};
          args[args.length - 1] = {
            ...init,
            headers: { ...defaultHeaders, ...(init.headers || {}) }
          };
          return await (fn as any).apply(null, args);
        };
      }
    }
    headersHttp.withTimeout = http.withTimeout;
    headersHttp.withHeaders = http.withHeaders;
    return headersHttp;
  }
};

function wrap(r: Response) {
  return {
    raw: r,
    ok: r.ok,
    status: r.status,
    text: () => r.text(),
    json: <T = unknown>() => r.json() as Promise<T>,
    html: () => r.text().then(s => new DOMParser().parseFromString(s, 'text/html'))
  };
}

function serialize(body: any) {
  if (body == null) return undefined;
  if (body instanceof FormData || typeof body === 'string' || body instanceof Blob) return body as any;
  if (typeof body === 'object') return JSON.stringify(body);
  return String(body);
}

function headers(init: RequestInit | undefined, body: any) {
  const h = new Headers(init?.headers);
  if (body && !(body instanceof FormData) && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json');
  }
  return h;
}