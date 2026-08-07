/**
 * i18n translations for ha-ai-server-card
 */

export interface TranslationMessages {
  status: Record<string, string>;
  card: Record<string, string>;
  toast: Record<string, string>;
  action: Record<string, string>;
  [key: string]: Record<string, string>;
}

export const translations: Record<string, TranslationMessages> = {
  en: {
    status: {
      running: 'Running',
      stopped: 'Stopped',
      starting: 'Starting',
      restarting: 'Restarting',
      unknown: 'Unknown',
    },
    card: {
      empty: 'No services configured',
      refresh: 'Refresh',
      now: 'now',
      seconds_ago: '{n}s ago',
      minutes_ago: '{n}m ago',
    },
    toast: {
      start: '{name}: Start',
      stop: '{name}: Stop',
      restart: '{name}: Restart',
      failed: 'Failed: {name}',
    },
    action: {
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      logs: 'Logs',
    },
    perf: {
      running: 'Running',
      waiting: 'Waiting',
      tok_iter: 'Gen tok/s',
      ttft: 'TTFT',
      itl: 'ITL',
    },
    metric: {
      gpu: 'GPU',
      ram: 'RAM',
      temp: 'Temp',
    },
  },
  fr: {
    status: {
      running: 'Actif',
      stopped: 'Arrêté',
      starting: 'Démarrage',
      restarting: 'Redémarrage',
      unknown: 'Inconnu',
    },
    card: {
      empty: 'Aucun service configuré',
      refresh: 'Actualiser',
      now: 'maintenant',
      seconds_ago: 'il y a {n}s',
      minutes_ago: 'il y a {n}min',
    },
    toast: {
      start: '{name} : Démarrage',
      stop: '{name} : Arrêt',
      restart: '{name} : Redémarrage',
      failed: 'Échec : {name}',
    },
    action: {
      start: 'Démarrer',
      stop: 'Arrêter',
      restart: 'Redémarrer',
      logs: 'Logs',
    },
    perf: {
      running: 'En cours',
      waiting: 'En attente',
      tok_iter: 'Gen tok/s',
      ttft: 'TTFT',
      itl: 'ITL',
    },
    metric: {
      gpu: 'GPU',
      ram: 'Mémoire',
      temp: 'Temp',
    },
  },
};

/**
 * Detect user language from HA (`hass.language`) or browser
 * hass.language is the effective language in priority order:
 *   - backend saved user selected language
 *   - language in local app storage
 *   - browser language
 *   - english (en)
 */
export function getLocale(hassLanguage?: string): string {
  if (hassLanguage && hassLanguage.toLowerCase().startsWith('fr')) return 'fr';
  return 'en';
}

/**
 * Format a translation string with parameters
 */
export function formatMessage(
  messages: TranslationMessages,
  category: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  const msg = messages[category]?.[key] ?? key;
  if (!params) return msg;
  return msg.replace(/\{(.*?)\}/g, (_: string, k: string) => String(params[k] ?? `{${k}}`));
}
