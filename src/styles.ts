import { css } from 'lit';

/**
 * Mushroom-inspired card styles - advanced
 */
export const cardStyles = css`
  /* === Card container === */
  ha-card {
    padding: 0;
    overflow: hidden;
    font-family: var(--paper-font-common-base, 'Roboto', sans-serif);
    background: var(--card-background-color, var(--primary-background-color, #ffffff));
  }

  /* === Header === */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--primary-text-color, #212121);
    line-height: 1;
  }

  .header-title ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color, #03a9f4);
    width: 20px;
    height: 20px;
    min-width: 20px;
    flex-shrink: 0;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    color: var(--secondary-text-color, #757575);
  }

  .header-time {
    font-size: 0.7rem;
    color: var(--secondary-text-color, #757575);
    opacity: 0.7;
  }

  /* === Server metrics grid === */
  .server-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .server-metric-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .server-metric-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
  }

  .server-metric-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    flex-shrink: 0;
  }

  .server-metric-icon ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--secondary-text-color, #757575);
  }

  .server-metric-label {
    color: var(--secondary-text-color, #757575);
    min-width: 32px;
  }

  .server-metric-value {
    margin-left: auto;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  .server-metric-value.warning {
    color: #ff9800;
  }

  .server-metric-value.critical {
    color: #f44336;
  }

  .server-metric-track {
    height: 6px;
    background: var(--divider-color, rgba(0, 0, 0, 0.08));
    border-radius: 3px;
    overflow: hidden;
  }

  .server-metric-fill {
    height: 100%;
    background: var(--primary-color, #03a9f4);
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .server-metric-fill.warning {
    background: #ff9800;
  }

  .server-metric-fill.critical {
    background: #f44336;
  }

  /* === Services grid === */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
    padding: 12px 16px 16px;
  }

  .services-grid.compact {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
    padding: 8px 16px 12px;
  }

  /* === Service card - Mushroom style === */
  .service-card {
    position: relative;
    background: var(--card-secondary-background-color, var(--secondary-background-color, #f5f5f5));
    border-radius: 12px;
    padding: 14px;
    border-left: 4px solid var(--service-color, var(--primary-color, #03a9f4));
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.3s ease;
    animation: card-fade-in 0.3s ease-out;
  }

  @keyframes card-fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .service-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  /* === Service header with icon circle === */
  .service-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    cursor: pointer;
    user-select: none;
  }

  .service-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .service-header-right ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .service-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    color: var(--secondary-text-color, #757575);
    transition: transform 0.2s ease;
  }

  .service-chevron.expanded {
    transform: rotate(180deg);
  }

  /* === Service body (expand/collapse) === */
  .service-body {
    overflow: hidden;
    transition:
      max-height 0.3s ease,
      opacity 0.25s ease;
    max-height: 0;
    opacity: 0;
    pointer-events: none;
  }

  .service-body.expanded {
    max-height: 600px;
    opacity: 1;
    pointer-events: auto;
  }

  .service-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .service-icon-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: color-mix(
      in srgb,
      var(--service-color, var(--primary-color, #03a9f4)) 15%,
      transparent
    );
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .service-icon-circle ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--service-color, var(--primary-color, #03a9f4));
    width: 20px;
    height: 20px;
  }

  .service-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--primary-text-color, #212121);
    line-height: 1.2;
  }

  .service-subtitle {
    font-size: 0.75rem;
    color: var(--secondary-text-color, #757575);
    margin-top: 2px;
  }

  /* === Status indicator === */
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 12px;
    transition:
      background 0.3s ease,
      transform 0.3s ease;
  }

  .status-indicator.flash {
    animation: status-flash 0.6s ease-out;
  }

  @keyframes status-flash {
    0% {
      transform: scale(1);
    }
    15% {
      transform: scale(1.25);
    }
    40% {
      transform: scale(0.95);
    }
    70% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .status-indicator.running {
    background: color-mix(in srgb, #4caf50 12%, transparent);
    color: #4caf50;
  }

  .status-indicator.stopped {
    background: color-mix(in srgb, #f44336 12%, transparent);
    color: #f44336;
  }

  .status-indicator.restarting {
    background: color-mix(in srgb, #ff9800 12%, transparent);
    color: #ff9800;
  }

  .status-indicator.starting {
    background: color-mix(in srgb, #03a9f4 12%, transparent);
    color: #03a9f4;
  }

  .status-indicator.unknown {
    background: color-mix(in srgb, #9e9e9e 12%, transparent);
    color: #9e9e9e;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot.running {
    background: #4caf50;
    animation: status-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 6px color-mix(in srgb, #4caf50 60%, transparent);
  }

  .status-dot.stopped {
    background: #f44336;
  }

  .status-dot.restarting {
    background: #ff9800;
    animation: status-pulse 1s ease-in-out infinite;
  }

  .status-dot.starting {
    background: #03a9f4;
    animation: status-pulse 1s ease-in-out infinite;
  }

  .status-dot.unknown {
    background: #9e9e9e;
  }

  @keyframes status-pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.85);
    }
  }

  /* === Model badge === */
  .model-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: var(--secondary-text-color, #757575);
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 8%, transparent);
    padding: 2px 8px;
    border-radius: 8px;
    margin-top: 8px;
  }

  .model-badge ha-icon {
    width: 24px;
    height: 24px;
  }

  /* === Metrics container === */
  .metrics-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 10px 0;
  }

  /* === Performance section === */
  .perf-section {
    margin: 10px 0 0;
    padding-top: 10px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  .perf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .perf-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    padding: 6px 8px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 6%, transparent);
    border-radius: 8px;
  }

  .perf-info.warning {
    background: color-mix(in srgb, #ff9800 12%, transparent);
  }

  .perf-info ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    min-width: 16px;
    color: var(--primary-color, #03a9f4);
    flex-shrink: 0;
  }

  .perf-info .perf-label {
    color: var(--secondary-text-color, #757575);
    font-size: 0.75rem;
  }

  .perf-info.warning ha-icon {
    color: #ff9800;
  }

  .perf-label {
    color: var(--secondary-text-color, #757575);
  }

  .perf-value {
    margin-left: auto;
    font-weight: 600;
    color: var(--primary-text-color, #212121);
  }

  .perf-bar {
    grid-column: 1 / -1;
  }

  /* === Metric row - Mushroom gauge style === */
  .metric-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
  }

  .metric-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    min-width: 16px;
    flex-shrink: 0;
  }

  .metric-icon-wrap ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--secondary-text-color, #757575);
  }

  .metric-label {
    min-width: 36px;
    color: var(--secondary-text-color, #757575);
  }

  .metric-value {
    margin-left: auto;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  .metric-track {
    height: 6px;
    background: var(--divider-color, rgba(0, 0, 0, 0.08));
    border-radius: 3px;
    overflow: hidden;
  }

  .metric-fill {
    height: 100%;
    border-radius: 3px;
    transition:
      width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.4s ease;
  }

  .metric-fill.normal {
    background: linear-gradient(90deg, var(--primary-color, #03a9f4), #4caf50);
  }

  .metric-fill.warning {
    background: linear-gradient(90deg, var(--primary-color, #03a9f4), #ff9800);
  }

  .metric-fill.critical {
    background: linear-gradient(90deg, #ff9800, #f44336);
  }

  /* === Info row (TPS, context) === */
  .info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--secondary-text-color, #757575);
    padding: 4px 0;
  }

  .info-row ha-icon {
    width: 24px;
    height: 24px;
    color: var(--primary-color, #03a9f4);
  }

  .info-value {
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  /* === Info grid (multiple info items) === */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    margin: 8px 0;
  }

  /* === Action buttons - Mushroom chip style === */
  .service-actions {
    display: flex;
    gap: 6px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  .action-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 10%, transparent);
    color: var(--primary-color, #03a9f4);
  }

  .action-chip:hover {
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
    transform: scale(1.05);
  }

  .action-chip:active {
    transform: scale(0.95);
  }

  .action-chip:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .action-chip.danger {
    background: color-mix(in srgb, #f44336 10%, transparent);
    color: #f44336;
  }

  .action-chip.danger:hover {
    background: color-mix(in srgb, #f44336 20%, transparent);
  }

  .action-chip.warning {
    background: color-mix(in srgb, #ff9800 10%, transparent);
    color: #ff9800;
  }

  .action-chip.warning:hover {
    background: color-mix(in srgb, #ff9800 20%, transparent);
  }

  /* === Uptime === */
  .service-uptime {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 0.75rem;
    color: var(--secondary-text-color, #757575);
  }

  .service-uptime ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .entity-warning {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 16px !important;
    height: 16px !important;
    color: #ff9800 !important;
    margin-left: 4px;
    flex-shrink: 0;
  }

  /* === Loading state === */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-top-color: var(--primary-color, #03a9f4);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* === Empty state === */
  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--secondary-text-color, #757575);
  }

  /* === Refresh button === */
  .refresh-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: var(--secondary-text-color, #757575);
    transition:
      color 0.2s ease,
      transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .refresh-btn ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .refresh-btn:hover {
    color: var(--primary-color, #03a9f4);
  }

  .refresh-btn.spinning ha-icon {
    animation: spin 1s linear infinite;
  }

  /* === Toast notification === */
  .card-toast {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    margin: 8px 12px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    animation: toast-fade-in 0.3s ease-out;
  }

  .card-toast ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
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
`;
