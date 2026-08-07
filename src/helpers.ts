import { ServiceStatus } from './types';

/**
 * Format a percentage value with color class
 */
export function getMetricColorClass(value: number): string {
  if (value >= 90) return 'critical';
  if (value >= 75) return 'warning';
  return 'normal';
}

/**
 * Get default icon for a service based on name
 */
export function getServiceIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('vllm') || lower.includes('llm')) return 'mdi:robot';
  if (lower.includes('ollama')) return 'mdi:brain';
  if (lower.includes('diffusion') || lower.includes('comfy')) return 'mdi:image';
  if (lower.includes('llama')) return 'mdi:lambda';
  return 'mdi:server';
}

/**
 * Get status icon for a service
 */
export function getStatusIcon(status: ServiceStatus): string {
  switch (status) {
    case 'running':
      return 'mdi:check-circle';
    case 'stopped':
      return 'mdi:cancel';
    case 'restarting':
      return 'mdi:refresh';
    default:
      return 'mdi:help-circle';
  }
}

/**
 * Check if a service string is valid (domain.service)
 */
export function isValidService(service: string | undefined): boolean {
  return !!service && service.includes('.');
}

/**
 * Parse service string to domain and service name
 */
export function parseService(service: string): { domain: string; service: string } {
  const [domain, svc] = service.split('.');
  return { domain, service: svc };
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format uptime seconds to human-readable string (e.g. "2d 3h 15m")
 */
export function formatUptime(seconds: number): string {
  if (seconds < 0) return 'Unknown';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
