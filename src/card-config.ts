/**
 * Card configuration types
 */

/**
 * Custom action definition
 */
export interface CustomAction {
  /** Display label */
  name: string;
  /** Service to call (e.g. "notify.messenger") */
  service: string;
  /** Optional icon override (e.g. "mdi:message") */
  icon?: string;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  name: string;
  // vLLM performance metrics (single JSON sensor) — also provides status, model, uptime
  metrics_entity?: string;
  // Actions (per-service)
  start_service?: string;
  stop_service?: string;
  restart_service?: string;
  logs_service?: string;
  // Style
  icon?: string;
  color?: string;
}

/**
 * Server metrics configuration (shared across all services)
 */
export interface ServerMetrics {
  gpu_entity?: string;
  memory_entity?: string;
  temperature_entity?: string;
}

/**
 * Server configuration
 */
export interface ServerConfig {
  name: string;
  ip?: string;
  metrics?: ServerMetrics;
  customActions?: CustomAction[];
}

/**
 * Display options
 */
export interface DisplayOptions {
  show_server_metrics?: boolean;
  show_gpu?: boolean;
  show_ram?: boolean;
  show_temp?: boolean;
  show_uptime?: boolean;
  show_model?: boolean;
  show_actions?: boolean;
  show_performance?: boolean;
  show_running?: boolean;
  show_waiting?: boolean;
  show_ttft?: boolean;
  show_itl?: boolean;
  show_tps?: boolean;
  refresh_interval?: number;
  compact?: boolean;
}

/**
 * Main card configuration
 */
export interface LlmServerCardConfig {
  type: string;
  server: ServerConfig;
  services: ServiceConfig[];
  options?: DisplayOptions;
}
