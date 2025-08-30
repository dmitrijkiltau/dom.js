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
  withTimeout(ms: number): HttpMethod { return createWithTimeout(http, ms); },
  withHeaders(defaultHeaders: Record<string, string>): HttpMethod { return createWithHeaders(http, defaultHeaders); }
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

// ——— Helper factories for composable helpers ———
function createWithTimeout(base: HttpMethod, ms: number): HttpMethod {
  const wrapper = {
    async get(url: string, init?: RequestInit) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ms);
      try { return await base.get(url, { ...(init || {}), signal: controller.signal }); }
      finally { clearTimeout(timeoutId); }
    },
    async delete(url: string, init?: RequestInit) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ms);
      try { return await base.delete(url, { ...(init || {}), signal: controller.signal }); }
      finally { clearTimeout(timeoutId); }
    },
    async post(url: string, body?: any, init?: RequestInit) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ms);
      try { return await base.post(url, body, { ...(init || {}), signal: controller.signal }); }
      finally { clearTimeout(timeoutId); }
    },
    async put(url: string, body?: any, init?: RequestInit) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ms);
      try { return await base.put(url, body, { ...(init || {}), signal: controller.signal }); }
      finally { clearTimeout(timeoutId); }
    },
    async patch(url: string, body?: any, init?: RequestInit) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ms);
      try { return await base.patch(url, body, { ...(init || {}), signal: controller.signal }); }
      finally { clearTimeout(timeoutId); }
    },
    withTimeout(nextMs: number) { return createWithTimeout(base, nextMs); },
    withHeaders(defaultHeaders: Record<string, string>) { return createWithHeaders(wrapper as unknown as HttpMethod, defaultHeaders); }
  } as HttpMethod;
  return wrapper;
}

function createWithHeaders(base: HttpMethod, defaultHeaders: Record<string, string>): HttpMethod {
  const merge = (init?: RequestInit): RequestInit => ({
    ...(init || {}),
    headers: { ...defaultHeaders, ...(init?.headers || {}) }
  });
  const wrapper = {
    get(url: string, init?: RequestInit) { return base.get(url, merge(init)); },
    delete(url: string, init?: RequestInit) { return base.delete(url, merge(init)); },
    post(url: string, body?: any, init?: RequestInit) { return base.post(url, body, merge(init)); },
    put(url: string, body?: any, init?: RequestInit) { return base.put(url, body, merge(init)); },
    patch(url: string, body?: any, init?: RequestInit) { return base.patch(url, body, merge(init)); },
    withTimeout(ms: number) { return createWithTimeout(wrapper as unknown as HttpMethod, ms); },
    withHeaders(next: Record<string, string>) { return createWithHeaders(base, { ...defaultHeaders, ...next }); }
  } as HttpMethod;
  return wrapper;
}
