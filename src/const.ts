/**
 * Card constants
 */
export const CARD_NAME = 'llm-server-card';
export const EDITOR_NAME = 'llm-server-card-editor';

/**
 * Default configuration values
 */
export const DEFAULT_REFRESH_INTERVAL = 30; // seconds

/* Vite build-time version stamp */
declare const __CARD_VERSION__: string;
export const CARD_VERSION = typeof __CARD_VERSION__ !== 'undefined' ? __CARD_VERSION__ : 'dev';
