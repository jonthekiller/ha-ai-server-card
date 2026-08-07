/**
 * Card configuration types
 */

/**
 * Service configuration
 */
export interface ServiceConfig {
  name: string;
  status_entity?: string;
  // Info
  model_entity?: string;
  uptime_entity?: string;
  // vLLM performance metrics (single JSON sensor)
  metrics_entity?: string;
  // Actions
  start_service?: string; // e.g., "shell_command.vllm_start"
  stop_service?: string; // e.g., "shell_command.vllm_stop"
  restart_service?: string; // e.g., "shell_command.vllm_restart"
  logs_service?: string; // e.g., "shell_command.vllm_logs"
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
  show_tok_iter?: boolean;
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
