/**
 * Service status enum
 */
export type ServiceStatus =
  'running' | 'stopped' | 'restarting' | 'starting' | 'paused' | 'unknown';

/**
 * GPU metrics data
 */
export interface GpuMetrics {
  usage_percent: number;
  memory_used: number; // MB
  memory_total: number; // MB
  temperature: number; // Celsius
}

/**
 * System metrics data
 */
export interface SystemMetrics {
  cpu_percent: number;
  memory_used: number; // MB
  memory_total: number; // MB
}

/**
 * AI inference metrics
 */
export interface InferenceMetrics {
  tokens_per_sec: number;
  context_length: number;
  max_context: number;
  prompt_tokens: number;
  generation_tokens: number;
}

/**
 * Metric display type
 */
export type MetricType = 'gauge' | 'value' | 'rate' | 'info';

/**
 * Service information
 */
export interface ServiceInfo {
  name: string;
  status: ServiceStatus;
  model?: string;
  gpu_metrics?: GpuMetrics;
  system_metrics?: SystemMetrics;
  inference_metrics?: InferenceMetrics;
  uptime?: string;
}

/**
 * Server information
 */
export interface ServerInfo {
  name: string;
  status: ServiceStatus;
  services: ServiceInfo[];
}
