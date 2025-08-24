import vk, { useTemplate, http } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addHttpExamples() {
  const httpSection = vk('#http');
  if (httpSection.length === 0) return;

  httpSection.append(renderSubsection({
    id: 'http-utilities',
    title: 'HTTP Utilities',
    content: `
      <p class="text-gray-700 mb-4">
        Make HTTP requests with a simple, promise-based API.
      </p>
    `
  }));

  const httpExample = renderExample({
    title: 'HTTP Requests',
    description: 'Fetch data and handle responses',
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
        
        <div id="http-results" class="p-4 bg-gray-50 border rounded min-h-[150px] overflow-auto">
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
    code: `import { http } from '@dmitrijkiltau/vanilla-kit';

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
  });

  httpSection.append(httpExample);

  function showLoading() {
    vk('#loading-indicator').removeClass('hidden');
    vk('#http-results').addClass('opacity-50');
  }

  function hideLoading() {
    vk('#loading-indicator').addClass('hidden');
    vk('#http-results').removeClass('opacity-50');
  }

  function showResult(title, content, isError = false) {
    const bgColor = isError ? 'bg-red-50 border-red-200' : 'bg-white';
    const titleColor = isError ? 'text-red-800' : 'text-gray-800';

    vk('#http-results').html(`
      <div class="${bgColor} border rounded p-4">
        <h5 class="font-semibold ${titleColor} mb-2">${title}</h5>
        <div class="text-sm text-gray-700">
          ${typeof content === 'string' ? content : `<pre class="whitespace-pre-wrap overflow-x-auto">${JSON.stringify(content, null, 2)}</pre>`}
        </div>
      </div>
    `);
  }

  // Add HTTP demo functionality
  vk('#fetch-data').on('click', async () => {
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

  vk('#fetch-users').on('click', async () => {
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

  vk('#fetch-specific').on('click', async () => {
    const postId = vk('#post-url').el().value || '1';
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

  vk('#post-data').on('click', async () => {
    showLoading();

    const samplePost = {
      title: 'Sample Post from vanilla-kit',
      body: 'This is a demonstration of the HTTP POST functionality in vanilla-kit. This will be sent to the JSONPlaceholder API.',
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

  vk('#error-demo').on('click', async () => {
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

  // Advanced HTTP example
  const advancedExample = renderExample({
    title: 'Advanced HTTP Patterns',
    description: 'Headers, authentication, and response handling',
    demo: `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium">Custom Headers</label>
            <input id="auth-token" placeholder="Authorization token" class="input" value="Bearer sample-token">
            <input id="custom-header" placeholder="X-Custom-Header" class="input" value="vanilla-kit-demo">
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium">Request Options</label>
            <select id="request-method" class="input">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input id="request-url" placeholder="URL" class="input" value="https://httpbin.org/headers">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Request Body (for POST/PUT)</label>
          <textarea id="request-body" class="input" rows="3" placeholder="JSON payload...">{
  "message": "Hello from vanilla-kit!",
  "timestamp": "${new Date().toISOString()}"
}</textarea>
        </div>
        
        <div class="flex space-x-2">
          <button id="send-request" class="btn btn-primary">Send Request</button>
          <button id="parallel-requests" class="btn btn-secondary">Parallel Requests Demo</button>
        </div>
        
        <div id="advanced-results" class="p-4 bg-gray-50 border rounded min-h-[150px] overflow-auto">
          <p class="text-gray-500 text-center">Configure and send a request...</p>
        </div>
      </div>
    `,
    code: `// Request with custom headers
const response = await http.get('/api/data', {
  headers: {
    'Authorization': 'Bearer token-here',
    'X-Custom-Header': 'custom-value',
    'Content-Type': 'application/json'
  }
});

// POST with full configuration
const response = await http.post('/api/endpoint', {
  name: 'John',
  email: 'john@example.com'
}, {
  headers: {
    'Authorization': 'Bearer token',
    'X-Client': 'vanilla-kit'
  },
  timeout: 5000
});

// Parallel requests
const [posts, users, comments] = await Promise.all([
  http.get('/api/posts'),
  http.get('/api/users'),
  http.get('/api/comments')
]);

const [postsData, usersData, commentsData] = await Promise.all([
  posts.json(),
  users.json(), 
  comments.json()
]);

// Error handling with retries
const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await http.get(url);
      if (response.ok) return response;
      
      if (i === retries - 1) throw new Error(\`Failed after \${retries} attempts\`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * i));
    }
  }
};`
  });

  httpSection.append(advancedExample);

  vk('#send-request').on('click', async () => {
    const method = vk('#request-method').el().value;
    const url = vk('#request-url').el().value;
    const authToken = vk('#auth-token').el().value;
    const customHeader = vk('#custom-header').el().value;
    const bodyText = vk('#request-body').el().value;

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

      showResult(`${method} Request Response`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers),
        data: responseData
      });

    } catch (error) {
      showResult('Request Error', `${method} request failed: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  vk('#parallel-requests').on('click', async () => {
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

      showResult('Parallel Requests Result', {
        duration: `${duration}ms`,
        requestCount: data.length,
        posts: data.map(post => ({
          id: post.id,
          title: post.title,
          userId: post.userId
        }))
      });

    } catch (error) {
      showResult('Parallel Requests Error', `One or more requests failed: ${error.message}`, true);
    } finally {
      hideLoading();
    }
  });

  // Set the current date in the request body template
  vk(window).on('DOMContentLoaded', () => {
    const currentTimestamp = new Date().toISOString();
    const currentBody = vk('#request-body').el().value.replace('${new Date().toISOString()}', currentTimestamp);
    vk('#request-body').el().value = currentBody;
  });
}
