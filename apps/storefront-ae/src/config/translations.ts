import {Locale} from "@/config/i18n";

export enum UI_STRING{
    MENU = "menu",
    LOGIN = "login",
    CLOSE = "close",
    CART = "cart",
    WISHLIST = "wishlist",
    ACCOUNT = "account",
}

export const UI_TRANSLATIONS: Record<UI_STRING, Record<Locale, string>> = {
    [UI_STRING.MENU]: { en: "Menu", ar: "القائمة" },
    [UI_STRING.LOGIN]: { en: "Login", ar: "تسجيل الدخول" },
    [UI_STRING.CLOSE]: { en: "Close", ar: "إغلاق" },
    [UI_STRING.CART]: { en: "Cart", ar: "عربة التسوق" },
    [UI_STRING.WISHLIST]: { en: "Wishlist", ar: "قائمة الأمنيات" },
    [UI_STRING.ACCOUNT]: { en: "Account", ar: "حسابي" },
}

export function translate(key: UI_STRING, locale: Locale): string {
    return UI_TRANSLATIONS[key][locale]
}