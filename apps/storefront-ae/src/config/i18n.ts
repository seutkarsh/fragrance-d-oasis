export const LOCALES = ["en", "ar"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"
export const RTL_LOCALES: Locale[] = ["ar"]

export function isValidLocale(value: string): value is Locale {
    return LOCALES.includes(value as Locale)
}

export function isRTL(locale: Locale): boolean {
    return RTL_LOCALES.includes(locale)
}