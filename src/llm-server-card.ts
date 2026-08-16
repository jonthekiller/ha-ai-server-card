import { LitElement, html, css, TemplateResult, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { cardStyles } from './styles';
import { CARD_NAME, CARD_VERSION, DEFAULT_REFRESH_INTERVAL } from './const';
import {
  LlmServerCardConfig,
  ServiceConfig,
  ServerConfig,
  ServerMetrics,
  DisplayOptions,
} from './card-config';
import { ServiceStatus } from './types';
import {
  getStatusIcon,
  getServiceIcon,
  isValidService,
  parseService,
  formatUptime,
  getMetricColorClass,
} from './helpers';
import { translations, getLocale, formatMessage, TranslationMessages } from './translations';
// Ensure editor custom element is registered and bundled
import './llm-server-card-editor';

console.log(`[llm-server-card] v${CARD_VERSION}`);

declare global {
  interface HTMLElementEventMap {
    'config-changed': CustomEvent<{ config: LlmServerCardConfig }>;
  }
}

/**
 * Minimal Home Assistant types (avoid custom-card-helpers dependency issues)
 */
interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

interface HomeAssistant {
  states: Record<string, HassEntity>;
  localize: (key: string) => string;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
  translate: string;
  language: string;
  locale?: { language?: string };
}

@customElement(CARD_NAME)
export class LlmServerCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ type: String }) private _title?: string;
  @state() private _config?: LlmServerCardConfig;
  @state() private _refreshing = false;
  @state() private _toast?: { message: string; type: 'success' | 'error' };
  @state() private _lastUpdate = Date.now();
  private _refreshInterval?: number;
  private _pendingStatuses = new Map<string, { status: ServiceStatus; timer: number }>();
  private _expandedServices = new Map<string, boolean>();
  private _changedServices = new Set<string>();
  private _previousServiceStatuses = new Map<string, ServiceStatus>();

  private get _messages(): TranslationMessages {
    const lang = getLocale(this.hass?.language ?? '');
    return translations[lang] ?? translations.en;
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement('llm-server-card-editor') as HTMLElement;
  }

  public static getStubConfig(_hass?: HomeAssistant): Record<string, unknown> {
    return {
      type: `custom:${CARD_NAME}`,
      title: 'AI Server',
      server: {
        name: 'Inference Server',
      },
      services: [
        {
          name: 'vLLM',
          status_entity: 'sensor.vllm_status',
          start_service: 'shell_command.vllm_start',
          stop_service: 'shell_command.vllm_stop',
          restart_service: 'shell_command.vllm_restart',
        },
      ],
    };
  }

  public setConfig(config: LlmServerCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    if (!config.server) {
      throw new Error('Server configuration is required');
    }
    if (!config.services || !Array.isArray(config.services)) {
      throw new Error('Services array is required');
    }

    this._config = {
      ...config,
      options: {
        show_server_metrics: true,
        show_gpu: true,
        show_ram: true,
        show_temp: true,
        show_uptime: true,
        show_model: true,
        show_actions: true,
        show_performance: true,
        show_running: true,
        show_waiting: true,
        show_ttft: true,
        show_itl: true,
        show_tps: true,
        refresh_interval: DEFAULT_REFRESH_INTERVAL,
        compact: false,
        ...config.options,
      },
    };

    this._setupRefresh();
  }

  private _renderServerActions(server: ServerConfig) {
    if (!server.customActions?.length) return html``;
    return html`
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 16px 8px; border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.12));">
        <span style="font-size:0.7rem; color: var(--secondary-text-color, #757575); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0;">
          ${this._messages.action.custom}
        </span>
        ${server.customActions.map((action) =>
          html`<ha-icon-button
            .label="${action.name}"
            title="${action.name}"
            @click=${() => this._handleServerAction(action)}
            @click.stop
          >
            <ha-icon icon="${action.icon ?? 'mdi:console-line'}"></ha-icon>
          </ha-icon-button>`,
        )}
      </div>
    `;
  }

  private async _handleServerAction(action: { name: string; service: string }): Promise<void> {
    if (!this.hass) return;
    const { domain, service: serviceName } = parseService(action.service);
    try {
      await this.hass.callService(domain, serviceName);
      this._showToast(
        formatMessage(this._messages, 'toast', 'action_executed', { name: action.name, service: this._config!.server.name }),
        'success',
      );
    } catch (err) {
      console.error(`Failed to call ${action.service}:`, err);
      this._showToast(
        formatMessage(this._messages, 'toast', 'failed', { name: action.name }),
        'error',
      );
    }
  }

  public getCardSize(): number {
    if (!this._config) return 1;
    return Math.max(3, this._config.services.length + 1);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const { server, services, options } = this._config;

    return html`
      <ha-card>
        ${this._renderHeader(server, options!)}
        ${server.metrics && options!.show_server_metrics !== false ? this._renderServerMetrics(server.metrics, options!) : ''}
        ${this._renderServerActions(server)}
        ${this._renderServices(services, options!)} ${this._toast ? this._renderToast() : ''}
      </ha-card>
    `;
  }

  private _renderServerMetric(
    icon: string,
    label: string,
    value: string,
    fillPct: number,
    colorClass: string,
  ) {
    return html`
      <div class="server-metric-item">
        <div class="server-metric-header">
          <span class="server-metric-icon">
            <ha-icon icon="${icon}"></ha-icon>
          </span>
          <span class="server-metric-label">${label}</span>
          <span class="server-metric-value ${colorClass}">${value}</span>
        </div>
        <div class="server-metric-track">
          <div class="server-metric-fill ${colorClass}" style="width: ${fillPct}%"></div>
        </div>
      </div>
    `;
  }

  private _renderServerMetrics(metrics: ServerMetrics, options: DisplayOptions) {
    const items: TemplateResult[] = [];

    if (options.show_gpu !== false && metrics.gpu_entity) {
      const entity = this.hass?.states[metrics.gpu_entity];
      if (entity) {
        const val = parseFloat(entity.state) || 0;
        const cls = getMetricColorClass(val);
        items.push(
          this._renderServerMetric(
            'mdi:chip',
            this._messages.metric.gpu,
            `${Math.round(val)}%`,
            Math.min(100, val),
            cls,
          ),
        );
      }
    }

    if (options.show_ram !== false && metrics.memory_entity) {
      const entity = this.hass?.states[metrics.memory_entity];
      if (entity) {
        const val = parseFloat(entity.state) || 0;
        const cls = getMetricColorClass(val);
        items.push(
          this._renderServerMetric(
            'mdi:memory',
            this._messages.metric.ram,
            `${Math.round(val)}%`,
            Math.min(100, val),
            cls,
          ),
        );
      }
    }

    if (options.show_temp !== false && metrics.temperature_entity) {
      const entity = this.hass?.states[metrics.temperature_entity];
      if (entity) {
        const temp = parseFloat(entity.state) || 0;
        const pct = Math.min(100, (temp / 100) * 100);
        const cls = getMetricColorClass(pct);
        items.push(
          this._renderServerMetric(
            'mdi:thermometer',
            this._messages.metric.temp,
            `${Math.round(temp)}°C`,
            pct,
            cls,
          ),
        );
      }
    }

    if (items.length === 0) return html``;

    return html`<div class="server-metrics-grid">${items}</div>`;
  }

  private _renderHeader(server: ServerConfig, options: DisplayOptions) {
    return html`
      <div class="card-header">
        <div class="header-title">
          <ha-icon icon="mdi:server"></ha-icon>
          <span>${server.name}</span>
        </div>
        <div class="header-meta">
          ${server.ip ? html`<span>${server.ip}</span>` : ''}
          <span class="header-time" title="${new Date(this._lastUpdate).toLocaleTimeString()}"
            >${this._formatTimeAgo()}</span
          >
          <button
            class="refresh-btn ${this._refreshing ? 'spinning' : ''}"
            @click=${this._handleRefresh}
            title="${this._messages.card.refresh}"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _formatTimeAgo(): string {
    const diff = Math.floor((Date.now() - this._lastUpdate) / 1000);
    if (diff < 5) return this._messages.card.now;
    if (diff < 60) return formatMessage(this._messages, 'card', 'seconds_ago', { n: String(diff) });
    return formatMessage(this._messages, 'card', 'minutes_ago', {
      n: String(Math.floor(diff / 60)),
    });
  }

  private _isServiceExpanded(serviceName: string, compact: boolean): boolean {
    return this._expandedServices.get(serviceName) ?? !compact;
  }

  private _toggleService(serviceName: string): void {
    const current = this._expandedServices.get(serviceName);
    this._expandedServices.set(serviceName, current === undefined ? false : !current);
    this.requestUpdate();
  }

  private _renderServices(services: ServiceConfig[], options: DisplayOptions) {
    if (!services.length) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:alert-circle" style="font-size: 2rem;"></ha-icon>
          <p>${this._messages.card.empty}</p>
        </div>
      `;
    }

    return html`
      <div class="services-grid ${classMap({ compact: !!options.compact })}">
        ${services.map((service) => this._renderServiceCard(service, options))}
      </div>
    `;
  }

  private _renderServiceCard(service: ServiceConfig, options: DisplayOptions) {
    const status = this._getServiceStatus(service);
    const icon = service.icon || getServiceIcon(service.name);
    // Model: show_model toggle + metrics_entity.attributes.model
    const modelFromMetrics = service.metrics_entity
      ? (this.hass?.states[service.metrics_entity]?.attributes?.model as string | undefined)
      : undefined;
    const model = options.show_model !== false ? modelFromMetrics : undefined;
    const expanded = this._isServiceExpanded(service.name, !!options.compact);

    return html`
      <div class="service-card" style="--service-color: ${service.color || 'var(--primary-color)'}">
        <div class="service-header" @click=${() => this._toggleService(service.name)}>
          <div class="service-title">
            <div class="service-icon-circle">
              <ha-icon icon="${icon}"></ha-icon>
            </div>
            <div>
              <div class="service-name">${service.name}</div>
              ${model ? html`<div class="service-subtitle">${model}</div>` : ''}
            </div>
          </div>
          <div class="service-header-right">
            <div
              class="status-indicator ${status}${this._changedServices.has(service.name) ? ' flash' : ''}"
            >
              <span class="status-dot ${status}"></span>
              <span>${this._messages.status[status] ?? status}</span>
            </div>
            <ha-icon
              class="service-chevron ${expanded ? 'expanded' : ''}"
              icon="mdi:chevron-down"
            ></ha-icon>
          </div>
        </div>

        <div class="service-body ${expanded ? 'expanded' : ''}">
          <div class="service-body-inner">
            ${options.show_performance !== false ? this._renderPerformance(service, status) : ''}
            ${this._renderUptime(service, options)}
            ${options.show_actions !== false ? this._renderActions(service, status) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private _renderPerformance(service: ServiceConfig, status: ServiceStatus) {
    if (!service.metrics_entity || !this.hass || status !== 'running') return html``;
    const entity = this.hass.states[service.metrics_entity];
    if (!entity || entity.state === 'unavailable' || entity.state === 'unknown') return html``;

    const opts = this._config!.options!;
    const attrs = entity.attributes;
    const running = Number(attrs.running) || 0;
    const waiting = Number(attrs.waiting) || 0;
    const ttft = Number(attrs.ttft) || 0;
    const itl = Number(attrs.itl) || 0;
    const tps = Number(attrs.tps) || 0;

    const ttftPct = Math.min(100, (ttft / 8000) * 100);
    const ttftColor = getMetricColorClass(ttftPct);
    const itlPct = Math.min(100, (itl / 300) * 100);
    const itlColor = getMetricColorClass(itlPct);

    const items: TemplateResult[] = [];

    // Grid: Running / Waiting / tok/s
    if (opts.show_running !== false) {
      items.push(html`
        <div class="perf-info">
          <ha-icon icon="mdi:play-circle"></ha-icon>
          <span class="perf-label">${this._messages.perf.running}</span>
          <span class="perf-value">${running}</span>
        </div>
      `);
    }
    if (opts.show_waiting !== false) {
      items.push(html`
        <div class="perf-info ${waiting > 0 ? 'warning' : ''}">
          <ha-icon icon="mdi:clock-outline"></ha-icon>
          <span class="perf-label">${this._messages.perf.waiting}</span>
          <span class="perf-value">${waiting}</span>
        </div>
      `);
    }
    if (opts.show_tps !== false) {
      items.push(html`
        <div class="perf-info">
          <ha-icon icon="mdi:speedometer"></ha-icon>
          <span class="perf-label">${this._messages.perf.tps}</span>
          <span class="perf-value">${tps}</span>
        </div>
      `);
    }

    // Bars: TTFT / ITL
    if (opts.show_ttft !== false) {
      items.push(html`
        <div class="metric-row">
          <div class="metric-header">
            <span class="metric-icon-wrap">
              <ha-icon icon="mdi:lightning-bolt"></ha-icon>
            </span>
            <span class="metric-label">${this._messages.perf.ttft}</span>
            <span class="metric-value ${ttftColor}">${Math.round(ttft)}ms</span>
          </div>
          <div class="metric-track">
            <div class="metric-fill ${ttftColor}" style="width: ${ttftPct}%"></div>
          </div>
        </div>
      `);
    }
    if (opts.show_itl !== false) {
      items.push(html`
        <div class="metric-row">
          <div class="metric-header">
            <span class="metric-icon-wrap">
              <ha-icon icon="mdi:speedometer-slow"></ha-icon>
            </span>
            <span class="metric-label">${this._messages.perf.itl}</span>
            <span class="metric-value ${itlColor}">${Math.round(itl)}ms</span>
          </div>
          <div class="metric-track">
            <div class="metric-fill ${itlColor}" style="width: ${itlPct}%"></div>
          </div>
        </div>
      `);
    }

    if (items.length === 0) return html``;

    return html`<div class="perf-section"><div class="perf-grid">${items}</div></div>`;
  }

  private _renderUptime(service: ServiceConfig, options: DisplayOptions): TemplateResult {
    if (options.show_uptime === false) return html``;

    const uptimeFromMetrics = service.metrics_entity
      ? (this.hass?.states[service.metrics_entity]?.attributes?.uptime as string | undefined)
      : undefined;

    const uptimeVal = uptimeFromMetrics;
    if (!uptimeVal) return html``;

    const displayUptime = () => {
      const secs = Number(uptimeVal);
      if (!isNaN(secs) && secs > 0) return formatUptime(secs);
      return uptimeVal;
    };
    return html`<div class="service-uptime">
      <ha-icon icon="mdi:clock-outline"></ha-icon>
      <span>${displayUptime()}</span>
    </div>`;
  }

  private _renderActions(service: ServiceConfig, status: ServiceStatus) {
    const actions: TemplateResult[] = [];

    if (service.start_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.start,
          'mdi:play',
          service.start_service,
          status === 'running' || status === 'starting' || status === 'restarting',
          service,
        ),
      );
    }
    if (service.stop_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.stop,
          'mdi:stop',
          service.stop_service,
          status === 'stopped',
          service,
        ),
      );
    }
    if (service.restart_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.restart,
          'mdi:restart',
          service.restart_service,
          false,
          service,
        ),
      );
    }
    if (service.logs_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.logs,
          'mdi:text-box',
          service.logs_service,
          false,
          service,
        ),
      );
    }
    if (actions.length === 0) return html``;

    return html`<div class="service-actions">${actions}</div>`;
  }

  private _renderActionButton(
    label: string,
    icon: string,
    service: string,
    disabled: boolean,
    serviceConfig: ServiceConfig,
  ) {
    return html`
      <ha-icon-button
        .label="${label}"
        .disabled=${disabled}
        title="${label}"
        @click=${() => this._handleAction(label, service, serviceConfig)}
        @click.stop
      >
        <ha-icon icon="${icon}"></ha-icon>
      </ha-icon-button>
    `;
  }

  private _getServiceStatus(service: ServiceConfig): ServiceStatus {
    // Check pending optimistic status first
    const pending = this._pendingStatuses.get(service.name);
    if (pending) {
      // Clear if HA state has caught up
      if (service.metrics_entity && this.hass) {
        const entity = this.hass.states[service.metrics_entity];
        if (entity) {
          const statusAttr = (entity.attributes?.status as string | undefined)?.toLowerCase();
          if (
            (pending.status === 'restarting' || pending.status === 'starting') &&
            (statusAttr === 'healthy' || statusAttr === 'starting')
          ) {
            this._clearPendingStatus(service.name);
          } else if (
            pending.status === 'stopped' &&
            (statusAttr === 'stopped' || statusAttr === 'unhealthy')
          ) {
            this._clearPendingStatus(service.name);
          }
        }
      }
      return pending.status;
    }

    // Read status from metrics_entity.attributes.status
    if (!service.metrics_entity || !this.hass) return 'unknown';
    const entity = this.hass.states[service.metrics_entity];
    if (!entity) return 'unknown';

    const statusAttr = (entity.attributes?.status as string | undefined)?.toLowerCase();
    if (statusAttr === 'healthy') return 'running';
    if (statusAttr === 'stopped') return 'stopped';
    if (statusAttr === 'starting') return 'starting';
    if (statusAttr === 'unhealthy') return 'restarting';
    return 'unknown';
  }

  private _setPendingStatus(serviceName: string, status: ServiceStatus): void {
    this._clearPendingStatus(serviceName);
    const timer = window.setTimeout(() => {
      this._clearPendingStatus(serviceName);
    }, 10000);
    this._pendingStatuses.set(serviceName, { status, timer });
    this.requestUpdate();
  }

  private _clearPendingStatus(serviceName: string): void {
    const pending = this._pendingStatuses.get(serviceName);
    if (pending) {
      clearTimeout(pending.timer);
      this._pendingStatuses.delete(serviceName);
    }
  }

  private async _handleAction(
    action: string,
    service: string,
    serviceConfig: ServiceConfig,
  ): Promise<void> {
    if (!this.hass || !isValidService(service)) return;
    const { domain, service: serviceName } = parseService(service);

    // Set optimistic status for known actions
    let pendingStatus: ServiceStatus | undefined;
    if (action === 'Start') pendingStatus = 'starting';
    else if (action === 'Stop') pendingStatus = 'stopped';
    else if (action === 'Restart') pendingStatus = 'restarting';

    if (pendingStatus) this._setPendingStatus(serviceConfig.name, pendingStatus);

    try {
      await this.hass.callService(domain, serviceName);
      this._showToast(
        formatMessage(this._messages, 'toast', 'action_executed', { name: action, service: serviceConfig.name }),
        'success',
      );
    } catch (err) {
      console.error(`Failed to call ${service}:`, err);
      this._clearPendingStatus(serviceConfig.name);
      this._showToast(
        formatMessage(this._messages, 'toast', 'failed', { name: serviceConfig.name }),
        'error',
      );
    }
  }

  private _showToast(message: string, type: 'success' | 'error'): void {
    this._toast = { message, type };
    setTimeout(() => {
      this._toast = undefined;
    }, 3000);
  }

  private _renderToast(): TemplateResult {
    return html`
      <div class="card-toast ${this._toast!.type}">
        <ha-icon
          icon="${this._toast!.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'}"
        ></ha-icon>
        <span>${this._toast!.message}</span>
      </div>
    `;
  }

  private async _handleRefresh(): Promise<void> {
    this._refreshing = true;
    this.requestUpdate();
    await new Promise((resolve) => setTimeout(resolve, 500));
    this._refreshing = false;
    this._lastUpdate = Date.now();
    this.requestUpdate();
  }

  private _setupRefresh(): void {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }

    const interval = this._config?.options?.refresh_interval ?? DEFAULT_REFRESH_INTERVAL;
    if (interval > 0) {
      this._refreshInterval = window.setInterval(() => {
        this._handleRefresh();
      }, interval * 1000);
    }
  }

  protected updated(): void {
    // Detect status changes for flash animation
    if (this._config && this.hass) {
      const changed = new Set<string>();
      for (const service of this._config.services) {
        const currentStatus = this._getServiceStatus(service);
        const prevStatus = this._previousServiceStatuses.get(service.name);
        if (prevStatus !== undefined && prevStatus !== currentStatus) {
          changed.add(service.name);
        }
        this._previousServiceStatuses.set(service.name, currentStatus);
      }
      this._changedServices = changed;
    }
    if (this._config) {
      this._setupRefresh();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
    for (const [name] of this._pendingStatuses) {
      this._clearPendingStatus(name);
    }
  }

  static get styles(): CSSResultGroup {
    return [
      cardStyles,
      css`
        /* === Overrides & card-specific === */
        .metric-detail {
          font-size: 0.7rem;
          color: var(--secondary-text-color, #757575);
          text-align: right;
          margin-top: -2px;
        }

        .metric-value-row {
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }

        /* === Action buttons === */
        .service-actions ha-icon-button {
          --mdc-icon-button-size: 36px;
          color: var(--secondary-text-color, #757575);
        }

        .service-actions ha-icon-button ha-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .service-actions ha-icon-button:hover:not([disabled]) {
          color: var(--primary-color, #03a9f4);
        }

        .service-actions ha-icon-button[disabled] {
          opacity: 0.3;
          pointer-events: none;
        }

        /* === Toast === */
        .card-toast {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          margin: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          animation: toast-fade-in 0.3s ease-out;
        }

        .card-toast.success {
          background: color-mix(in srgb, #4caf50 12%, transparent);
          color: #4caf50;
        }

        .card-toast.success ha-icon {
          color: #4caf50;
        }

        .card-toast.error {
          background: color-mix(in srgb, #f44336 12%, transparent);
          color: #f44336;
        }

        .card-toast.error ha-icon {
          color: #f44336;
        }

        .card-toast ha-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        @keyframes toast-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
    ];
  }
}

// Register card with Home Assistant
(window as unknown as Record<string, unknown[]>).customCards =
  (window as unknown as Record<string, unknown[]>).customCards || [];
(window as unknown as Record<string, unknown[]>).customCards.push({
  type: CARD_NAME,
  name: 'AI Server Card',
  description: 'Manage AI inference servers with status, metrics, and actions.',
  preview: true,
});
