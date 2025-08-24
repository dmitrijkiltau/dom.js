# Troubleshooting Documentation Build Issues

## Prism.js Import Error

### Problem
If you encounter the error: `Failed to resolve import "prismjs" from "main.js". Does the file exist?`

### Root Cause
The documentation uses Prism.js for syntax highlighting in code examples. This error occurs when the npm dependencies are not installed in the `docs/` folder.

### Solution
1. Navigate to the docs folder:
   ```bash
   cd docs/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the main vanilla-kit library first (if not already done):
   ```bash
   cd .. && npm install && npm run build
   ```

4. Now the docs should build and run successfully:
   ```bash
   cd docs/
   npm run build  # or npm run dev
   ```

### Verification
You can test that Prism.js imports work by running:
```bash
cd docs/
node test-prism-imports.js
```

### Dependencies
The following Prism.js dependencies are used:
- `prismjs` - Core syntax highlighting library
- `prismjs/components/prism-javascript.js` - JavaScript language support  
- `prismjs/themes/prism-tomorrow.css` - Tomorrow theme for styling

These are defined in `docs/package.json` and will be automatically installed with `npm install`.