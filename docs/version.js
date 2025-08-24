// Extract version from package.json
import packageJson from '../package.json' with { type: 'json' };

export const version = packageJson.version;