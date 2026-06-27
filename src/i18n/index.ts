import en from "./en.json";

export type Translations = typeof en;
export type Locale = "en";

const translations: Record<Locale, Translations> = {
  en,
};

/**
 * Get translations for the given locale.
 * Falls back to English if the locale is not found.
 */
export function useTranslations(locale: Locale = "en"): Translations {
  return translations[locale] || translations.en;
}

/**
 * Simple template interpolation.
 * Replaces {key} placeholders in the string with values from the params object.
 *
 * Example: t("Page {current} of {total}", { current: 1, total: 5 })
 * Returns: "Page 1 of 5"
 */
export function t(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}