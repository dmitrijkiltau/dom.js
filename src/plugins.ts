// ——— Plugin system module ———

export type Plugin = (api: any) => void;

// Plugin registry to prevent duplicate registration
const _plugins = new Set<Plugin>();

/**
 * Register and execute a plugin
 * Ensures plugins are only executed once
 */
export function use(plugin: Plugin, api: any): void {
  if (!_plugins.has(plugin)) {
    plugin(api);
    _plugins.add(plugin);
  }
}

/**
 * Check if a plugin is already registered
 */
export function hasPlugin(plugin: Plugin): boolean {
  return _plugins.has(plugin);
}

/**
 * Get list of registered plugins (for debugging)
 */
export function getRegisteredPlugins(): Plugin[] {
  return Array.from(_plugins);
}

/**
 * Clear all registered plugins (mainly for testing)
 */
export function clearPlugins(): void {
  _plugins.clear();
}