import en from "./en.json";
import sk from "./sk.json";

export type Translations = typeof en;
export type Locale = "en" | "sk";

const translations: Record<Locale, Translations> = {
  en,
  sk,
};

/**
 * Extract locale from an Astro cookies object.
 */
export function getLocale(
  cookies?: { get: (name: string) => { value: string } | undefined },
): Locale {
  const value = cookies?.get("lang")?.value;
  if (value === "sk" || value === "en") return value;
  return "en";
}

/**
 * Get translations for the given locale or Astro cookies.
 * When called without arguments in an Astro component, automatically
 * reads the "lang" cookie via the Astro global.
 * Falls back to English if the locale is not found.
 */
export function useTranslations(
  localeOrCookies?: Locale | { get: (name: string) => { value: string } | undefined },
): Translations {
  if (!localeOrCookies) return translations.en;
  if (typeof localeOrCookies === "string") {
    return translations[localeOrCookies] || translations.en;
  }
  // It's a cookies-like object
  return useTranslations(getLocale(localeOrCookies));
}

/**
 * Simple template interpolation.
 * Replaces {key} placeholders in the string with values from the params object.
 *
 * Example: t("Page {current} of {total}", { current: 1, total: 5 })
 * Returns: "Page 1 of 5"
 */
export function t(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    String(params[key] ?? `{${key}}`),
  );
}