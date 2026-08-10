/**
 * AI Server Card Editor
 *
 * Pure HTMLElement (no Lit) — native DOM only.
 *
 * IMPORTANT: HA passes a frozen Proxy for `config`. DO NOT mutate it.
 * All handlers mutate `this._config` (our own mutable copy) then emit
 * `config-changed`. HA re-calls setConfig with a new frozen copy.
 */
import { EDITOR_NAME } from './const';
import {
  LlmServerCardConfig,
  ServiceConfig,
  ServerConfig,
  DisplayOptions,
  ServerMetrics,
} from './card-config';

declare global {
  interface HTMLElementEventMap {
    'config-changed': CustomEvent<{ config: LlmServerCardConfig }>;
  }
}

/* ── Defaults ──────────────────────────────────── */

function defaultServer(): ServerConfig {
  return { name: 'Inference Server' };
}

function defaultService(index: number): ServiceConfig {
  return { name: `Service ${index}` };
}

function defaultOptions(): DisplayOptions {
  return {
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
    show_tok_iter: true,
    show_ttft: true,
    show_itl: true,
    refresh_interval: 30,
    compact: false,
  };
}

/* ── Decorator fallback ───────────────────────── */

function customElement(name: string) {
  return function (cls: any) {
    if (!customElements.get(name)) customElements.define(name, cls);
    return cls;
  };
}

/* ── Deep clone utility ───────────────────────── */
// HA passes frozen objects. JSON roundtrip strips descriptors entirely.
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/* ── Editor class ──────────────────────────────── */

@customElement(EDITOR_NAME)
export class LlmServerCardEditor extends HTMLElement {
  public hass?: any;
  public lovelace?: any;
  public context?: any;

  /* Our own mutable copy — never the original HA Proxy */
  private _config = { type: '' } as any;

  private _container: HTMLDivElement | null = null;
  private _expandedServices = new Set<number>();
  private _serviceTabs = new Map<number, string>();

  /* Track the frozen original so we can detect when HA re-assigns */
  private _lastConfigId = 0;

  /* ── setConfig (called by HA on every edit) ──── */
  public setConfig(config: LlmServerCardConfig): void {
    this._lastConfigId++;

    // Deep clone EVERYTHING — frozen descriptors die in the JSON roundtrip
    const cloned = deepClone(config) as any;

    // Ensure required sections
    if (!cloned.server) cloned.server = defaultServer();
    if (!Array.isArray(cloned.services) || cloned.services.length === 0) {
      cloned.services = [defaultService(1)];
      this._expandedServices.clear();
      this._expandedServices.add(0);
      this._serviceTabs.clear();
      this._serviceTabs.set(0, 'basic');
    } else {
      cloned.services.forEach((_: any, i: number) => {
        if (!this._expandedServices.has(i) && !this._serviceTabs.has(i)) {
          this._expandedServices.add(i);
          this._serviceTabs.set(i, 'basic');
        }
      });
    }
    if (!cloned.options) cloned.options = defaultOptions();
    if (!cloned.server.metrics) {
      cloned.server.metrics = {};
    }

    this._config = cloned;
    this._render();
  }

  /* ── Constructor ─────────────────────────────── */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = this.styles();
    this.shadowRoot!.appendChild(style);

    const container = document.createElement('div');
    container.className = 'form';
    this.shadowRoot!.appendChild(container);
    this._container = container;
  }

  /* ── Paul's Frontend API ─────────────────────── */
  public static async getConfigElement(): Promise<HTMLElement> {
    if (!customElements.get(EDITOR_NAME)) {
      customElements.define(EDITOR_NAME, LlmServerCardEditor);
    }
    return document.createElement(EDITOR_NAME);
  }

  public static getStubConfig(): Record<string, unknown> {
    return {
      type: `custom:${EDITOR_NAME}`,
      server: defaultServer(),
      services: [defaultService(1)],
      options: defaultOptions(),
    };
  }

  /* ── Mutation helpers ────────────────────────── */
  // Mutate this._config immutably, emit config-changed.
  // HA will call setConfig again with a fresh frozen copy.

  private _setOption(key: string, value: any): void {
    this._config.options = { ...this._config.options, [key]: value };
    this._fireConfigChanged();
  }

  private _setServer(key: string, value: any): void {
    this._config.server = { ...this._config.server, [key]: value };
    this._fireConfigChanged();
  }

  private _setServerMetric(key: string, value: string): void {
    this._config.server.metrics = {
      ...(this._config.server.metrics as ServerMetrics),
      [key]: value,
    };
    this._fireConfigChanged();
  }

  private _setService(idx: number, key: string, value: any): void {
    const services = [...this._config.services];
    services[idx] = { ...services[idx], [key]: value };
    this._config.services = services;
    this._fireConfigChanged();
  }

  /* ── Rendering ───────────────────────────────── */

  private _render(): void {
    const container = this._container!;
    if (!container) return;

    const c = this._config;
    if (!c || Object.keys(c).length === 0) {
      container.textContent = 'Loading...';
      return;
    }

    // Always full rebuild — avoids stale frozen DOM references
    container.innerHTML = '';

    // Server
    container.appendChild(this._section('Server'));
    const server = c.server || defaultServer();
    container.appendChild(
      this._makeField('Server name', server.name ?? '', (v) => this._setServer('name', v)),
    );
    container.appendChild(
      this._makeField('Server IP (optional)', (server as any).ip ?? '', (v) =>
        this._setServer('ip', v),
      ),
    );
    // Server Metrics (shared) — each picker on its own full-width line
    const metrics: ServerMetrics = (server as any).metrics || {};
    container.appendChild(this._section('Server Metrics (shared across services)', true));
    [
      ['gpu_entity', 'GPU entity'],
      ['memory_entity', 'Memory entity'],
      ['temperature_entity', 'Temperature entity'],
    ].forEach(([key, lbl]) => {
      container.appendChild(
        this._entityField(
          lbl,
          String((metrics as any)[key] ?? ''),
          (v) => this._setServerMetric(key, v),
          ['sensor'],
        ),
      );
    });

    // Server Custom Actions (host-level)
    container.appendChild(this._section('Host Custom Actions', true));
    const hostActions: Array<{ name: string; service: string; icon?: string }> = (server as any).customActions ?? [];

    // Datalist for shell_command autocomplete
    const shellCmds = Object.keys((this.hass?.services?.shell_command as any) ?? {});
    const dl = document.createElement('datalist');
    dl.id = 'ha-ai-shell-cmds';
    for (const cmd of shellCmds) {
      const opt = document.createElement('option');
      opt.value = `shell_command.${cmd}`;
      dl.appendChild(opt);
    }
    container.appendChild(dl);

    hostActions.forEach((act, ai) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px;';

      const iname = document.createElement('input');
      iname.value = act.name ?? '';
      iname.placeholder = 'Name';
      iname.className = 'input-fallback';
      iname.style.flex = '1';

      const ico = document.createElement('input');
      ico.value = act.icon || '';
      ico.placeholder = 'mdi:console';
      ico.className = 'input-fallback';
      ico.style.flex = '1';
      ico.setAttribute('list', 'ha-ai-icons');

      const isvc = document.createElement('input');
      isvc.value = act.service ?? '';
      isvc.placeholder = 'shell_command.x';
      isvc.className = 'input-fallback';
      isvc.style.flex = '2';
      isvc.setAttribute('list', 'ha-ai-shell-cmds');

      const bdel = document.createElement('button');
      bdel.textContent = '×';
      bdel.className = 'btn-remove';
      bdel.style.cssText = 'padding: 4px 10px; font-size: 1rem; flex-shrink: 0;';
      bdel.addEventListener('click', () => {
        const filtered = hostActions.filter((_, i) => i !== ai);
        this._setServer('customActions', filtered.length ? filtered : undefined);
        this._render();
      });

      const sync = () => {
        const updated = [...hostActions];
        updated[ai] = { name: iname.value, service: isvc.value, icon: ico.value || undefined };
        this._setServer('customActions', updated);
      };
      iname.addEventListener('change', sync);
      ico.addEventListener('change', sync);
      isvc.addEventListener('change', sync);
      row.appendChild(iname);
      row.appendChild(ico);
      row.appendChild(isvc);
      row.appendChild(bdel);
      container.appendChild(row);
    });

    const addActionBtn = document.createElement('button');
    addActionBtn.className = 'btn-add';
    addActionBtn.style.marginTop = '4px';
    addActionBtn.textContent = '+ Add Host Action';
    addActionBtn.addEventListener('click', () => {
      const next = [...hostActions, { name: 'New Action', service: '' }];
      this._setServer('customActions', next);
      this._render();
    });
    container.appendChild(addActionBtn);

    // Services
    container.appendChild(this._section('Services'));
    const services = c.services || [];
    services.forEach((svc: ServiceConfig, idx: number) => {
      container.appendChild(this._renderServiceEditor(svc, idx, services.length));
    });
    container.appendChild(this._addServiceBtn());

    // Display Options
    const opts: DisplayOptions = c.options || defaultOptions();
    container.appendChild(this._section('Display Options'));
    container.appendChild(
      this._makeField('Refresh interval (s)', String(opts.refresh_interval ?? 30), (v) =>
        this._setOption('refresh_interval', Number(v) > 0 ? Number(v) : 30),
      ),
    );

    // Server Metrics toggles
    container.appendChild(this._section('Server Metrics'));
    const smDiv = document.createElement('div');
    smDiv.className = 'grid';
    [
      ['show_server_metrics', 'GPU / RAM / Temp'],
      ['show_gpu', 'GPU'],
      ['show_ram', 'RAM'],
      ['show_temp', 'Temperature'],
    ].forEach(([key, label]) => {
      smDiv.appendChild(
        this._makeToggle(key, label, (opts as any)[key], (v) => this._setOption(key, v)),
      );
    });
    container.appendChild(smDiv);

    // Service Display toggles
    container.appendChild(this._section('Service Display'));
    const sdDiv = document.createElement('div');
    sdDiv.className = 'grid';
    [
      ['show_model', 'Model'],
      ['show_uptime', 'Uptime'],
      ['show_actions', 'Actions'],
    ].forEach(([key, label]) => {
      sdDiv.appendChild(
        this._makeToggle(key, label, (opts as any)[key], (v) => this._setOption(key, v)),
      );
    });
    container.appendChild(sdDiv);

    // Performance toggles
    container.appendChild(this._section('Performance Metrics'));
    const pfDiv = document.createElement('div');
    pfDiv.className = 'grid';
    [
      ['show_performance', 'Performance'],
      ['show_running', 'Running'],
      ['show_waiting', 'Waiting'],
      ['show_ttft', 'TTFT'],
      ['show_itl', 'ITL'],
      ['show_tok_iter', 'Gen tok/s'],
    ].forEach(([key, label]) => {
      pfDiv.appendChild(
        this._makeToggle(key, label, (opts as any)[key], (v) => this._setOption(key, v)),
      );
    });
    container.appendChild(pfDiv);

    // Help
    container.appendChild(this._helpBox());
  }

  /* ── Service editor ──────────────────────────── */

  private _renderServiceEditor(
    service: ServiceConfig,
    index: number,
    total: number,
  ): HTMLDivElement {
    const expanded = this._expandedServices.has(index);
    const activeTab = this._serviceTabs.get(index) ?? 'basic';

    const wrapper = document.createElement('div');
    wrapper.className = 'sub-section';

    // ── Header ──
    const header = document.createElement('div');
    header.className = 'service-header';
    header.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.btn-remove')) return;
      this._toggleServiceExpand(index);
      this._render();
    });

    const left = document.createElement('div');
    left.className = 'service-header-left';

    const chevron = document.createElement('span');
    chevron.className = 'service-chevron' + (expanded ? ' open' : '');
    chevron.textContent = '▼';
    left.appendChild(chevron);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'service-title-text';
    nameSpan.dataset.serviceName = String(index);
    nameSpan.textContent = service.name || `Service ${index + 1}`;
    nameSpan.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this._editNameInline(nameSpan, service, index);
    });
    left.appendChild(nameSpan);
    header.appendChild(left);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = '✕';
    removeBtn.disabled = total === 1;
    removeBtn.style.opacity = total === 1 ? '0.3' : '1';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const services = [...this._config.services];
      services.splice(index, 1);
      this._config.services = services;
      this._expandedServices.delete(index);
      this._serviceTabs.delete(index);
      this._remapServiceState(index);
      this._fireConfigChanged();
      this._render();
    });
    header.appendChild(removeBtn);
    wrapper.appendChild(header);

    // ── Body ──
    if (expanded) {
      const body = document.createElement('div');
      body.className = 'service-body';
      body.appendChild(this._tabs(index, activeTab));

      let tabContent: HTMLDivElement;
      switch (activeTab) {
        case 'basic':
          tabContent = this._tabBasic(service, index);
          break;
        case 'entities':
          tabContent = this._tabEntities(service, index);
          break;
        case 'actions':
          tabContent = this._tabActions(service, index);
          break;
        default:
          tabContent = this._tabBasic(service, index);
      }
      body.appendChild(tabContent);
      wrapper.appendChild(body);
    }

    return wrapper;
  }

  private _editNameInline(span: HTMLElement, service: ServiceConfig, idx: number): void {
    if (!span.parentElement) return;
    const parent = span.parentElement;
    parent.removeChild(span);

    const useHa = customElements.get('ha-textfield');
    if (useHa) {
      const tf = document.createElement('ha-textfield') as any;
      tf.value = service.name || '';
      tf.setAttribute('fullwidth', '');
      tf.autofocus = true;

      const finish = () => {
        this._setService(idx, 'name', (tf.value as string).trim() || `Service ${idx + 1}`);
        this._render();
      };
      tf.addEventListener('change', finish);
      tf.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') tf.blur();
        if (e.key === 'Escape') {
          tf.value = service.name || '';
          tf.blur();
        }
      });
      parent.appendChild(tf);
      requestAnimationFrame(() => tf.focus());
      return;
    }

    const input = document.createElement('input');
    input.value = service.name || '';
    input.className = 'inline-edit';

    const finish = () => {
      this._setService(idx, 'name', input.value.trim() || `Service ${idx + 1}`);
      this._render();
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') {
        input.value = service.name || '';
        input.blur();
      }
    });
    parent.appendChild(input);
    input.focus();
    input.select();
  }

  private _toggleServiceExpand(index: number): void {
    if (this._expandedServices.has(index)) this._expandedServices.delete(index);
    else this._expandedServices.add(index);
  }

  private _remapServiceState(removed: number): void {
    const ne = new Set<number>();
    for (const i of this._expandedServices) {
      if (i < removed) ne.add(i);
      else if (i > removed) ne.add(i - 1);
    }
    this._expandedServices = ne;
    const nt = new Map<number, string>();
    for (const [i, tab] of this._serviceTabs) {
      if (i < removed) nt.set(i, tab);
      else if (i > removed) nt.set(i - 1, tab);
    }
    this._serviceTabs = nt;
  }

  /* ── Tabs ──────────────────────────────────── */

  private _tabs(index: number, active: string): HTMLDivElement {
    const tabContainer = document.createElement('div');
    tabContainer.className = 'tabs';
    [
      ['basic', 'Basic'],
      ['entities', 'Entities'],
      ['actions', 'Actions'],
    ].forEach(([key, label]) => {
      const tab = document.createElement('div');
      tab.className = 'tab' + (active === key ? ' active' : '');
      tab.textContent = label;
      tab.addEventListener('click', () => {
        this._serviceTabs.set(index, key);
        this._render();
      });
      tabContainer.appendChild(tab);
    });
    return tabContainer;
  }

  /* ── Tab: Basic ───────────────────────────── */

  private _tabBasic(service: ServiceConfig, idx: number): HTMLDivElement {
    const container = document.createElement('div');
    container.appendChild(
      this._entityField(
        'Status entity (required)',
        (service as any).status_entity ?? '',
        (v) => this._setService(idx, 'status_entity', v),
        ['sensor', 'binary_sensor'],
      ),
    );

    const styleLabel = document.createElement('div');
    styleLabel.className = 'label';
    styleLabel.style.cssText = 'margin-top:12px;margin-bottom:6px;';
    styleLabel.textContent = 'Appearance';
    container.appendChild(styleLabel);

    const styleGrid = document.createElement('div');
    styleGrid.className = 'entity-grid';
    [
      ['icon', 'Icon (MDI)'],
      ['color', 'Color (CSS)'],
    ].forEach(([key, label]) => {
      styleGrid.appendChild(
        this._makeField(
          label,
          (service as any)[key] ?? (key === 'icon' ? 'mdi:server' : '#529cf6'),
          (v) => this._setService(idx, key, v),
        ),
      );
    });
    container.appendChild(styleGrid);

    return container;
  }

  /* ── Tab: Entities ────────────────────────── */

  private _tabEntities(service: ServiceConfig, idx: number): HTMLDivElement {
    const container = document.createElement('div');

    const hint = document.createElement('div');
    hint.className = 'label';
    hint.style.marginBottom = '8px';
    hint.textContent = 'Entity IDs (leave blank if not needed)';
    container.appendChild(hint);

    const perfLabel = document.createElement('div');
    perfLabel.className = 'label';
    perfLabel.style.cssText = 'margin-bottom:4px;margin-top:4px;';
    perfLabel.textContent = 'Performance';
    container.appendChild(perfLabel);

    const perfGrid = document.createElement('div');
    perfGrid.className = 'entity-grid';
    perfGrid.appendChild(
      this._entityField(
        'vLLM metrics entity',
        (service as any).metrics_entity ?? '',
        (v) => this._setService(idx, 'metrics_entity', v),
        ['sensor'],
      ),
    );
    container.appendChild(perfGrid);

    const infoLabel = document.createElement('div');
    infoLabel.className = 'label';
    infoLabel.style.cssText = 'margin-bottom:4px;margin-top:8px;';
    infoLabel.textContent = 'Info';
    container.appendChild(infoLabel);

    const infoGrid = document.createElement('div');
    infoGrid.className = 'entity-grid';
    container.appendChild(infoGrid);
    [
      ['model_entity', 'Model entity'],
      ['uptime_entity', 'Uptime entity'],
    ].forEach(([key, lbl]) => {
      infoGrid.appendChild(
        this._entityField(lbl, (service as any)[key] ?? '', (v) => this._setService(idx, key, v), [
          'sensor',
        ]),
      );
    });

    return container;
  }

  /* ── Tab: Actions ─────────────────────────── */

  private _tabActions(service: ServiceConfig, idx: number): HTMLDivElement {
    const container = document.createElement('div');
    const hint = document.createElement('div');
    hint.className = 'label';
    hint.style.marginBottom = '8px';
    hint.textContent = 'Service calls (HA service id) — leave blank to hide.';
    container.appendChild(hint);

    const grid = document.createElement('div');
    grid.className = 'entity-grid';
    [
      ['start_service', 'Start'],
      ['stop_service', 'Stop'],
      ['restart_service', 'Restart'],
      ['logs_service', 'Logs'],
    ].forEach(([key, label]) => {
      grid.appendChild(
        this._serviceField(label, (service as any)[key] ?? '', key, (v) =>
          this._setService(idx, key, v),
        ),
      );
    });
    container.appendChild(grid);

    return container;
  }

  /* ── Add service ───────────────────────────── */

  private _addServiceBtn(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'btn-add';
    btn.textContent = '+ Add Service';
    btn.addEventListener('click', () => {
      const services = [...this._config.services];
      const newIdx = services.length;
      services.push(defaultService(newIdx + 1));
      this._config.services = services;
      this._expandedServices.add(newIdx);
      this._serviceTabs.set(newIdx, 'basic');
      this._fireConfigChanged();
      this._render();
    });
    return btn;
  }

  /* ── Field builders ────────────────────────── */

  private _makeField(
    label: string,
    value: string,
    onChange: (val: string) => void,
    type: 'text' | 'number' = 'text',
  ): HTMLDivElement {
    const field = document.createElement('div');
    field.className = 'field';

    // Prefer ha-textfield if available
    const haTf = customElements.get('ha-textfield');
    if (haTf) {
      const tf = document.createElement('ha-textfield') as any;
      tf.setAttribute('label', label);
      tf.setAttribute('name', label.toLowerCase().replace(/\s+/g, '-'));
      tf.setAttribute('fullwidth', '');
      tf.value = value;
      if (type === 'number') {
        tf.type = 'number';
        tf.setAttribute('min', '1');
      }
      tf.addEventListener('change', () => onChange(String(tf.value ?? '')));
      field.appendChild(tf);
      return field;
    }

    const labelEl = document.createElement('label');
    labelEl.className = 'label';
    labelEl.textContent = label;

    const input = document.createElement('input');
    input.type = type;
    input.className = 'input-fallback';
    input.placeholder = label;
    input.value = value;
    input.addEventListener('change', () => onChange(input.value));

    field.appendChild(labelEl);
    field.appendChild(input);
    return field;
  }

  private _entityField(
    label: string,
    value: string,
    onChange: (val: string) => void,
    filterEntityTypes?: string[],
  ): HTMLDivElement {
    const field = document.createElement('div');
    field.className = 'field';

    const picker = document.createElement('ha-entity-picker') as any;
    picker.hass = this.hass;
    picker.value = value;
    picker.label = label;
    picker.setAttribute('fullwidth', '');
    if (filterEntityTypes) picker.filterEntityTypes = filterEntityTypes;
    picker.addEventListener('value-changed', () => {
      // ha-entity-picker returns ['entity_id'] array
      onChange(Array.isArray(picker.value) ? picker.value[0] || '' : picker.value || '');
    });
    field.appendChild(picker);
    return field;
  }

  private _makeSelect(
    label: string,
    values: string[],
    labels: string[],
    current: string,
    onChange: (val: string) => void,
  ): HTMLDivElement {
    const field = document.createElement('div');
    field.className = 'field';

    const labelEl = document.createElement('label');
    labelEl.className = 'label';
    labelEl.textContent = label;

    // Use native <select> — ha-select has Material Web init issues in dynamic editors
    const select = document.createElement('select');
    select.className = 'select-fallback';

    values.forEach((val, i) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = labels[i];
      if (val === current) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => onChange(select.value));

    field.appendChild(labelEl);
    field.appendChild(select);
    return field;
  }

  private _serviceOptions(action: string): string[] {
    if (!this.hass?.services) return [];
    const out: string[] = [];
    const domains = Object.keys(this.hass.services);
    const keyword = action.split('_')[0]; // 'start', 'stop', 'restart', 'logs'
    for (const domain of domains) {
      const methods = Object.keys(this.hass.services[domain]);
      for (const method of methods) {
        if (method.includes(keyword) || domain === keyword) {
          out.push(`${domain}.${method}`);
        }
      }
    }
    return out.sort();
  }

  private _serviceField(
    label: string,
    value: string,
    action: string,
    onChange: (val: string) => void,
  ): HTMLDivElement {
    const opts = ['', ...this._serviceOptions(action)];
    const lbls = ['—', ...opts.slice(1)];
    return this._makeSelect(label, opts, lbls, value, onChange);
  }

  private _makeToggle(
    key: string,
    label: string,
    checked: boolean,
    onChange: (val: boolean) => void,
  ): HTMLDivElement {
    const div = document.createElement('div');
    const lbl = document.createElement('label');
    lbl.className = 'tog-label';

    const sw = document.createElement('ha-switch');
    (sw as any).checked = !!checked;
    sw.addEventListener('change', () => onChange((sw as any).checked === true));

    const span = document.createElement('span');
    span.textContent = label;

    lbl.appendChild(sw);
    lbl.appendChild(span);
    div.appendChild(lbl);
    return div;
  }

  /* ── Section helpers ───────────────────────── */

  private _section(title: string, sub = false): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'section';
    if (sub) div.style.fontSize = '0.7rem';
    div.textContent = title;
    return div;
  }

  private _helpBox(): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'help-box';
    div.innerHTML = `
      <p style="margin: 0 0 6px 0; font-weight: 600; color: var(--primary-text-color, #000);">
        ℹ️ Configuration Help
      </p>
      <p style="margin: 0 0 4px 0;"><strong>Server:</strong> Define your AI server name.</p>
      <p style="margin: 0 0 4px 0;"><strong>Server Metrics:</strong> Shared metrics (GPU, RAM, temperature) displayed once for all services.</p>
      <p style="margin: 0 0 4px 0;"><strong>Services:</strong> Add each AI service with its associated HA entities.</p>
      <p style="margin: 0 0 4px 0;"><strong>Display Options:</strong> Customize which metrics and info to show.</p>
      <p style="margin: 0; color: var(--secondary-text-color);">Entity IDs can be left blank — the card will show a placeholder when no entity is set.</p>
    `;
    return div;
  }

  private _fireConfigChanged(): void {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        bubbles: true,
        composed: true,
        detail: { config: this._config },
      }),
    );
  }

  /* ── CSS ───────────────────────────────────── */

  private styles(): string {
    return `
      :host { display: block; font-family: var(--paper-font-body_-_font-family, -apple-system, BlinkMacSystemFont, sans-serif); }
      .form { padding: 8px 0; }
      .section {
        font-size: 0.75rem; font-weight: 600; color: var(--primary-color, #529cf6);
        text-transform: uppercase; letter-spacing: 0.04em; margin: 16px 0 8px 4px;
      }
      .section:first-child { margin-top: 0; }
      .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
      .label {
        font-size: 0.8rem; color: var(--secondary-text-color, #757575); font-weight: 500;
        margin-left: 4px;
      }
      .input-fallback,
      .inline-edit {
        padding: 8px 12px; border-radius: 8px;
        border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 15%, transparent);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        font-size: 0.9rem; font-family: inherit; outline: none;
        transition: border-color 0.15s;
      }
      .input-fallback:focus,
      .inline-edit:focus {
        border-color: var(--primary-color, #529cf6);
      }
      .select-fallback {
        width: 100%; padding: 8px 32px 8px 12px; border-radius: 8px;
        border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 15%, transparent);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        font-size: 0.9rem; font-family: inherit; cursor: pointer; outline: none;
        appearance: none; -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23529cf6' stroke-width='2' fill='none'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 12px center;
        transition: border-color 0.15s;
      }
      .select-fallback:focus { border-color: var(--primary-color, #529cf6); }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin-bottom: 8px; }
      .tog-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
      ha-switch.tog-switch { --switch-unchecked-button-color: var(--primary-color, #529cf6); }
      .sub-section {
        margin: 8px 0; padding: 12px;
        border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 10%, transparent);
        border-radius: 8px;
        background: color-mix(in srgb, var(--card-background-color, #fff) 95%, var(--primary-text-color, #000) 5%);
      }
      .service-header {
        display: flex; align-items: center; justify-content: space-between; cursor: pointer;
        padding: 8px 6px;
        background: color-mix(in srgb, var(--card-background-color, #fff) 90%, var(--primary-text-color, #000) 10%);
        border-radius: 8px; border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 10%, transparent);
        margin-bottom: 4px; transition: background 0.15s;
      }
      .service-header:hover { background: color-mix(in srgb, var(--primary-color, #529cf6) 8%, var(--card-background-color, #fff) 92%); }
      .service-header-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
      .service-chevron { color: var(--primary-color, #529cf6); transition: transform 0.2s; font-size: 1.1rem; }
      .service-chevron.open { transform: rotate(180deg); }
      .service-title-text { flex: 1; font-size: 0.95rem; font-weight: 600; color: var(--primary-text-color, #000); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .service-body { padding: 8px 8px 4px; }
      .tabs { display: flex; gap: 0; margin-bottom: 10px; border-bottom: 2px solid color-mix(in srgb, var(--primary-text-color, #000) 10%, transparent); }
      .tab {
        padding: 6px 14px; font-size: 0.8rem; font-weight: 500; color: var(--secondary-text-color, #888);
        cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px;
        transition: color 0.15s, border-color 0.15s; text-transform: uppercase; letter-spacing: 0.03em;
      }
      .tab:hover { color: var(--primary-color, #529cf6); }
      .tab.active { color: var(--primary-color, #529cf6); border-bottom-color: var(--primary-color, #529cf6); }
      .btn-remove {
        background: color-mix(in srgb, #f44336 15%, transparent); border: none; color: #f44336;
        border-radius: 6px; padding: 6px 12px; font-size: 0.8rem; cursor: pointer; font-weight: 500;
      }
      .btn-remove:hover { background: color-mix(in srgb, #f44336 25%, transparent); }
      .btn-add {
        display: flex; align-items: center; gap: 6px;
        background: color-mix(in srgb, var(--primary-color, #529cf6) 12%, transparent);
        border: 1px solid var(--primary-color, #529cf6); color: var(--primary-color, #529cf6);
        border-radius: 8px; padding: 8px 16px; font-size: 0.85rem; font-weight: 500; cursor: pointer;
        margin-top: 8px; width: 100%; justify-content: center;
      }
      .btn-add:hover { background: color-mix(in srgb, var(--primary-color, #529cf6) 20%, transparent); }
      .help-box {
        margin-top: 16px; padding: 12px;
        background: color-mix(in srgb, var(--primary-color, #529cf6) 6%, transparent);
        border-radius: 8px; font-size: 0.8rem; color: var(--secondary-text-color, #757575); line-height: 1.5;
      }
      .help-box strong { color: var(--primary-text-color, #000); }
      .entity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      ha-entity-picker { min-width: 0; }
      .service-field { margin-bottom: 4px; }
      .service-field ha-combo-box {
        --mdc-typography-overline-font-size: 0.65rem;
        height: 35px;
      }
    `;
  }
}

// Register
if (!customElements.get(EDITOR_NAME)) {
  customElements.define(EDITOR_NAME, LlmServerCardEditor);
}

export default LlmServerCardEditor;
