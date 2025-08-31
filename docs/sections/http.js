import dom, { useTemplate, http } from '../../dist/index.js';
import { createTabbedExamples } from '../content.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addHttpExamples() {
  const httpSection = dom('#http');
  if (httpSection.length === 0) return;

  httpSection.append(renderSubsection({
    id: 'http-utilities-overview',
    title: 'HTTP Utilities',
    content: `
      <p class="text-gray-700 mb-4">
        Make HTTP requests with a simple, promise-based API.
      </p>
    `
  }));

  // Create tabbed examples for HTTP functionality
  const httpTabbedExamples = createTabbedExamples({
    id: 'http-examples-tabs',
    title: 'HTTP Request Examples',
    description: 'Explore different HTTP functionality with interactive examples',
    tabs: [
      {
        id: 'basic-requests',
        title: 'Basic Requests',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
              <button id="fetch-data" class="btn btn-primary">Fetch JSONPlaceholder Data</button>
              <button id="fetch-users" class="btn btn-secondary">Fetch Users</button>
              <button id="post-data" class="btn btn-secondary">Post Data (Demo)</button>
              <button id="error-demo" class="btn btn-secondary">Test Error Handling</button>
            </div>
            
            <div class="flex space-x-2">
              <input id="post-url" placeholder="Post ID (1-100)" class="input flex-1" value="1" type="number" min="1" max="100">
              <button id="fetch-specific" class="btn btn-primary">Fetch Specific Post</button>
            </div>
            
            <div id="http-results" class="p-4 bg-gray-50 border border-gray-300 rounded min-h-[150px] overflow-auto">
              <p class="text-gray-500 text-center">Click a button above to see results...</p>
            </div>
            
            <div id="loading-indicator" class="hidden text-center py-4">
              <div class="inline-flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span class="ml-2 text-blue-600">Loading...</span>
              </div>
            </div>
          </div>
        `,
        code: `import { http } from '@dmitrijkiltau/dom.js';

// GET request
try {
  const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
  
  console.log('Status:', response.status);
  console.log('OK:', response.ok);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Data:', data);
  }
} catch (error) {
  console.error('Request failed:', error);
}

// POST request
const postData = { 
  title: 'New Post', 
  body: 'Content here...', 
  userId: 1 
};

try {
  const response = await http.post('/api/posts', postData);
  const result = await response.json();
  console.log('Created:', result);
} catch (error) {
  console.error('Error:', error);
}

// Other HTTP methods
await http.put('/api/posts/1', updateData);
await http.patch('/api/posts/1', partialData);
await http.delete('/api/posts/1');

// Response helpers
const response = await http.get('/api/data');
const text = await response.text();     // String
const json = await response.json();     // Object  
const html = await response.html();     // DOM Element`
      },
      {
        id: 'request-helpers',
        title: 'Request Helpers',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium mb-2">Timeout Configuration</h5>
                <div class="space-y-2">
                  <input id="timeout-duration" type="number" class="input" value="3000" min="1000" max="10000" step="1000">
                  <label class="text-sm text-gray-600">Timeout (ms)</label>
                  <button id="timeout-demo" class="btn btn-primary w-full text-sm">Test Timeout</button>
                  <button id="slow-request-demo" class="btn btn-secondary w-full text-sm">Slow Request (5s)</button>
                </div>
              </div>
              <div>
                <h5 class="font-medium mb-2">Default Headers</h5>
                <div class="space-y-2">
                  <input id="auth-header" class="input text-sm" placeholder="Authorization" value="Bearer demo-token">
                  <input id="client-header" class="input text-sm" placeholder="X-Client" value="dom.js-demo">
                  <input id="version-header" class="input text-sm" placeholder="X-Version" value="1.0">
                  <button id="headers-demo" class="btn btn-primary w-full text-sm">Test Headers</button>
                </div>
              </div>
            </div>
            
            <div class="space-y-2">
              <h5 class="font-medium">Combined Configuration</h5>
              <div class="flex space-x-2">
                <button id="combined-demo" class="btn btn-accent text-sm">Timeout + Headers</button>
                <button id="chain-demo" class="btn btn-accent text-sm">Chain Helpers</button>
                <button id="clear-helpers-demo" class="btn btn-outline text-sm">Clear Results</button>
              </div>
            </div>
            
            <div id="helpers-output" class="text-sm bg-gray-50 border border-gray-300 rounded p-4 min-h-[150px] overflow-auto">
              <p class="text-gray-500 text-center">Try the HTTP request helpers above...</p>
            </div>
          </div>
        `,
        code: `import { http } from '@dmitrijkiltau/dom.js';

// Create HTTP client with timeout
const timeoutHttp = http.withTimeout(5000); // 5 second timeout
const response = await timeoutHttp.get('/slow-endpoint');

// Create HTTP client with default headers
const authedHttp = http.withHeaders({
  'Authorization': 'Bearer token',
  'X-Client': 'my-app',
  'Content-Type': 'application/json'
});

// All requests will include these headers automatically
const response = await authedHttp.post('/api/data', { name: 'John' });

// Chain helpers for combined configuration
const configuredHttp = http
  .withTimeout(3000)
  .withHeaders({
    'Authorization': 'Bearer token',
    'X-Version': '1.0'
  });

// Use the configured client
const users = await configuredHttp.get('/api/users');
const result = await configuredHttp.post('/api/users', userData);

// Headers are merged with request-specific headers
const response = await authedHttp.get('/endpoint', {
  headers: { 'X-Request-ID': '123' } // Merged with default headers
});`
      },
      {
        id: 'advanced-patterns',
        title: 'Advanced Patterns',
        demo: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium">Custom Headers</label>
                  <input id="auth-token" class="input text-sm" placeholder="Authorization token" value="Bearer sample-token">
                  <input id="custom-header" class="input text-sm" placeholder="X-Custom-Header" value="dom.js-demo">
                </div>
              </div>
              <div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium">Request Options</label>
                  <select id="request-method" class="input">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input id="request-url" class="input text-sm" placeholder="URL" value="https://httpbin.org/headers">
                </div>
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium">Request Body (for POST/PUT)</label>
              <textarea id="request-body" class="input" rows="3" placeholder="JSON payload...">{ "message": "Hello from dom.js!", "timestamp": "2025-08-26T14:59:44.987Z" }</textarea>
            </div>
            
            <div class="flex space-x-2">
              <button id="send-request" class="btn btn-primary">Send Request</button>
              <button id="parallel-requests" class="btn btn-secondary">Parallel Requests Demo</button>
            </div>
            
            <div id="advanced-results" class="p-4 bg-gray-50 border border-gray-300 rounded min-h-[150px] overflow-auto">
              <p class="text-gray-500 text-center">Configure and send a request...</p>
            </div>
          </div>
        `,
        code: `import { http } from '@dmitrijkiltau/dom.js';

// Advanced request with custom headers
const customHeaders = {
  'Authorization': 'Bearer your-token',
  'X-Custom-Header': 'value',
  'Content-Type': 'application/json'
};

try {
  const response = await http.post('/api/data', {
    message: 'Hello from dom.js!',
    timestamp: new Date().toISOString()
  }, {
    headers: customHeaders
  });

  if (response.ok) {
    const result = await response.json();
    console.log('Success:', result);
  } else {
    console.log('Error:', response.status, await response.text());
  }
} catch (error) {
  console.error('Network error:', error);
}

// Parallel requests
const [users, posts, comments] = await Promise.all([
  http.get('/api/users').then(r => r.json()),
  http.get('/api/posts').then(r => r.json()),
  http.get('/api/comments').then(r => r.json())
]);

// Request with timeout and retry logic
const requestWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await http.get(url, {
        ...options,
        timeout: 5000
      });
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};`
      }
    ]
  });

  httpSection.append(httpTabbedExamples);

  // Keep all the existing event handlers and utility functions
  function showLoading() {
    dom('#loading-indicator').removeClass('hidden');
    dom('#http-results').addClass('opacity-50');
  }

  function hideLoading() {
    dom('#loading-indicator').addClass('hidden');
    dom('#http-results').removeClass('opacity-50');
  }

  function showResult(title, content, isError = false) {
    const bgColor = isError ? 'bg-red-50 border-red-200' : 'bg-gray-100';
    const titleColor = isError ? 'text-red-800' : 'text-gray-800';

    dom('#http-results').html(`
      <div class="${bgColor} border border-gray-300 rounded p-4">
        <h5 class="font-semibold ${titleColor} mb-2">${title}</h5>
        <div class="text-sm text-gray-700">
          ${typeof content === 'string' ? content : `<pre class="whitespace-pre-wrap overflow-x-auto">${JSON.stringify(content, null, 2)}</pre>`}
        </div>
      </div>
    `);
  }

  function showAdvancedResult(title, content, isError = false) {
    const bgColor = isError ? 'bg-red-50 border-red-200' : 'bg-gray-100';
    const titleColor = isError ? 'text-red-800' : 'text-gray-800';

    dom('#advanced-results').html(`
      <div class="${bgColor} border border-gray-300 rounded p-4">
        <h5 class="font-semibold ${titleColor} mb-2">${title}</h5>
        <div class="text-sm text-gray-700">
          ${typeof content === 'string' ? content : `<pre class="whitespace-pre-wrap overflow-x-auto">${JSON.stringify(content, null, 2)}</pre>`}
        </div>
      </div>
    `);
  }

  // Add HTTP demo functionality
  dom('#fetch-data').on('click', async () => {
    showLoading();
    try {
      const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
      const data = await response.json();

      showResult('Fetched Post Data', {
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      showResult('Error', `Failed to fetch data: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  dom('#fetch-users').on('click', async () => {
    showLoading();
    try {
      const response = await http.get('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();

      const userList = users.slice(0, 5).map(user => `
        <div class="border-b pb-2 mb-2 last:border-b-0">
          <div class="font-medium">${user.name}</div>
          <div class="text-sm text-gray-600">${user.email}</div>
          <div class="text-xs text-gray-500">${user.company.name}</div>
        </div>
      `).join('');

      showResult('Users List (First 5)', `
        <div class="space-y-2">
          ${userList}
        </div>
        <div class="mt-3 text-xs text-gray-500">
          Total users: ${users.length}
        </div>
      `);
    } catch (error) {
      showResult('Error', `Failed to fetch users: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  dom('#fetch-specific').on('click', async () => {
    const postId = dom('#post-url').el().value || '1';
    showLoading();

    try {
      const response = await http.get(`https://jsonplaceholder.typicode.com/posts/${postId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
      }

      const post = await response.json();

      showResult(`Post #${postId}`, `
        <div class="space-y-3">
          <div>
            <div class="font-semibold text-lg">${post.title}</div>
            <div class="text-sm text-gray-600">User ID: ${post.userId}</div>
          </div>
          <div class="text-gray-700">${post.body}</div>
          <div class="text-xs text-gray-500">
            Response status: ${response.status} ${response.ok ? '(Success)' : '(Error)'}
          </div>
        </div>
      `);
    } catch (error) {
      showResult('Error', `Failed to fetch post: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  dom('#post-data').on('click', async () => {
    showLoading();

    const samplePost = {
      title: 'Sample Post from dom.js',
      body: 'This is a demonstration of the HTTP POST functionality in dom.js. This will be sent to the JSONPlaceholder API.',
      userId: 1
    };

    try {
      const response = await http.post('https://jsonplaceholder.typicode.com/posts', samplePost);
      const result = await response.json();

      showResult('POST Request Result', {
        status: response.status,
        ok: response.ok,
        sentData: samplePost,
        responseData: result
      });
    } catch (error) {
      showResult('Error', `POST request failed: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  dom('#error-demo').on('click', async () => {
    showLoading();

    try {
      // This will trigger a 404 error
      const response = await http.get('https://jsonplaceholder.typicode.com/posts/99999');

      showResult('Error Handling Demo', {
        status: response.status,
        ok: response.ok,
        message: `Request returned ${response.status} status`
      }, !response.ok);

    } catch (error) {
      showResult('Network Error', `Request failed completely: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  // Keep helper functions and event handlers for the tabbed examples
  
  function showHelpersResult(title, content, isError = false) {
    const bgColor = isError ? 'bg-red-50 border-red-200' : 'bg-gray-100';
    const titleColor = isError ? 'text-red-800' : 'text-gray-800';
    const timestamp = new Date().toLocaleTimeString();

    const resultHtml = `
      <div class="${bgColor} border rounded p-3 mb-3">
        <div class="flex justify-between items-center mb-2">
          <h6 class="font-medium ${titleColor}">${title}</h6>
          <span class="text-xs text-gray-500">[${timestamp}]</span>
        </div>
        <div class="text-sm text-gray-700">
          ${typeof content === 'string' ? content : `<pre class="whitespace-pre-wrap text-xs overflow-x-auto">${JSON.stringify(content, null, 2)}</pre>`}
        </div>
      </div>
    `;

    dom('#helpers-output').append(resultHtml);
    dom('#helpers-output').el().scrollTop = dom('#helpers-output').el().scrollHeight;
  }

  dom('#timeout-demo').on('click', async () => {
    const timeout = parseInt(dom('#timeout-duration').val()) || 3000;
    
    try {
      const timeoutHttp = http.withTimeout(timeout);
      showHelpersResult('Timeout Test Started', `Testing with ${timeout}ms timeout...`);
      
      const response = await timeoutHttp.get('https://httpbin.org/delay/1'); // 1 second delay
      const data = await response.json();
      
      showHelpersResult('Timeout Success', {
        timeout: `${timeout}ms`,
        status: response.status,
        actualDelay: '1000ms',
        result: 'Request completed within timeout'
      });
    } catch (error) {
      showHelpersResult('Timeout Error', `Request failed: ${error.message}`, true);
    }
  });

  dom('#slow-request-demo').on('click', async () => {
    const timeout = parseInt(dom('#timeout-duration').val()) || 3000;
    
    try {
      const timeoutHttp = http.withTimeout(timeout);
      showHelpersResult('Slow Request Started', `5-second request with ${timeout}ms timeout...`);
      
      const response = await timeoutHttp.get('https://httpbin.org/delay/5'); // 5 second delay
      const data = await response.json();
      
      showHelpersResult('Slow Request Success', 'Request completed (should only succeed if timeout > 5000ms)');
    } catch (error) {
      showHelpersResult('Expected Timeout', `Request timed out as expected: ${error.message}`, false);
    }
  });

  dom('#headers-demo').on('click', async () => {
    const authHeader = dom('#auth-header').val();
    const clientHeader = dom('#client-header').val();
    const versionHeader = dom('#version-header').val();
    
    try {
      const headersHttp = http.withHeaders({
        'Authorization': authHeader,
        'X-Client': clientHeader,
        'X-Version': versionHeader
      });

      showHelpersResult('Headers Request Started', 'Sending request with default headers...');
      
      const response = await headersHttp.get('https://httpbin.org/headers');
      const data = await response.json();
      
      showHelpersResult('Headers Success', {
        sentHeaders: {
          'Authorization': authHeader,
          'X-Client': clientHeader,
          'X-Version': versionHeader
        },
        receivedHeaders: data.headers
      });
    } catch (error) {
      showHelpersResult('Headers Error', `Request failed: ${error.message}`, true);
    }
  });

  dom('#combined-demo').on('click', async () => {
    const timeout = parseInt(dom('#timeout-duration').val()) || 3000;
    
    try {
      // Create client with both timeout and headers
      const configuredHttp = http.withTimeout(timeout).withHeaders({
        'X-Demo': 'combined-config',
        'X-Timeout': timeout.toString()
      });

      showHelpersResult('Combined Config Started', `Request with ${timeout}ms timeout and custom headers...`);
      
      const response = await configuredHttp.get('https://httpbin.org/headers');
      const data = await response.json();
      
      showHelpersResult('Combined Config Success', {
        configuration: {
          timeout: `${timeout}ms`,
          headers: ['X-Demo', 'X-Timeout']
        },
        result: data.headers
      });
    } catch (error) {
      showHelpersResult('Combined Config Error', `Request failed: ${error.message}`, true);
    }
  });

  dom('#chain-demo').on('click', async () => {
    try {
      showHelpersResult('Chain Demo Started', 'Demonstrating helper method chaining...');
      
      // Show that helpers can be chained and create independent clients
      const client1 = http.withTimeout(2000);
      const client2 = http.withHeaders({ 'X-Client': 'client2' });
      const client3 = client1.withHeaders({ 'X-Client': 'combined' }); // Chain on existing client
      
      const response = await client3.get('https://httpbin.org/headers');
      const data = await response.json();
      
      showHelpersResult('Chain Demo Success', {
        explanation: 'client3 = client1.withTimeout(2000).withHeaders({...})',
        finalHeaders: data.headers,
        note: 'Each helper returns a new configured HTTP client'
      });
    } catch (error) {
      showHelpersResult('Chain Demo Error', `Request failed: ${error.message}`, true);
    }
  });

  dom('#clear-helpers-demo').on('click', () => {
    dom('#helpers-output').html('<p class="text-gray-500 text-center">Results cleared. Try the HTTP request helpers above...</p>');
  });

  // Advanced example event handlers (used in tabbed structure)
  dom('#send-request').on('click', async () => {
    const method = dom('#request-method').el().value;
    const url = dom('#request-url').el().value;
    const authToken = dom('#auth-token').el().value;
    const customHeader = dom('#custom-header').el().value;
    const bodyText = dom('#request-body').el().value;

    showLoading();

    try {
      const headers = {};
      if (authToken) headers['Authorization'] = authToken;
      if (customHeader) headers['X-Custom-Header'] = customHeader;

      let response;
      let requestBody = null;

      if (method === 'POST' || method === 'PUT') {
        try {
          requestBody = bodyText ? JSON.parse(bodyText) : null;
        } catch (e) {
          requestBody = bodyText;
        }
      }

      switch (method) {
        case 'GET':
          response = await http.get(url, { headers });
          break;
        case 'POST':
          response = await http.post(url, requestBody, { headers });
          break;
        case 'PUT':
          response = await http.put(url, requestBody, { headers });
          break;
        case 'DELETE':
          response = await http.delete(url, { headers });
          break;
      }

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      showAdvancedResult(`${method} Request Response`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers),
        data: responseData
      });

    } catch (error) {
      showAdvancedResult('Request Error', `${method} request failed: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  dom('#parallel-requests').on('click', async () => {
    showLoading();

    try {
      const startTime = Date.now();

      // Make multiple requests in parallel
      const requests = [
        http.get('https://jsonplaceholder.typicode.com/posts/1'),
        http.get('https://jsonplaceholder.typicode.com/posts/2'),
        http.get('https://jsonplaceholder.typicode.com/posts/3')
      ];

      const responses = await Promise.all(requests);
      const data = await Promise.all(responses.map(r => r.json()));

      const endTime = Date.now();
      const duration = endTime - startTime;

      showAdvancedResult('Parallel Requests Result', {
        duration: `${duration}ms`,
        requestCount: data.length,
        posts: data.map(post => ({
          id: post.id,
          title: post.title,
          userId: post.userId
        }))
      });

    } catch (error) {
      showAdvancedResult('Parallel Requests Error', `One or more requests failed: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  // Set the current date in the request body template
  dom(window).on('DOMContentLoaded', () => {
    const currentTimestamp = new Date().toISOString();
    const currentBody = dom('#request-body').el().value.replace('${new Date().toISOString()}', currentTimestamp);
    dom('#request-body').el().value = currentBody;
  });
}
