import type { Locale } from "./i18n"

export const ROUTES = {
    home: (locale: Locale) => `/${locale}`,
    products: (locale: Locale) => `/${locale}/products`,
    product: (locale: Locale, handle: string) => `/${locale}/products/${handle}`,
    category: (locale: Locale, handle: string) => `/${locale}/categories/${handle}`,
    cart: (locale: Locale) => `/${locale}/cart`,
    checkout: (locale: Locale) => `/${locale}/checkout`,
    account: (locale: Locale) => `/${locale}/account`,
    login: (locale: Locale) => `/${locale}/login`,
} as const