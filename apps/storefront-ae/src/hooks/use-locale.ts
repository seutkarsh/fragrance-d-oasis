import { useParams } from "next/navigation"
import { isValidLocale, DEFAULT_LOCALE } from "@/config/i18n"
import type { Locale } from "@/config/i18n"

export function useLocale(): Locale {
    const params = useParams()
    const locale = params.locale
    return isValidLocale(locale as string) ? (locale as Locale) : DEFAULT_LOCALE
}