export const LOCALES_CONFIG = [
    { code: "en", name: "English", isRtl: false },
    { code: "ar", name: "Arabic", isRtl: true },
    { code: "hi", name: "Hindi", isRtl: false },
    { code: "es", name: "Spanish", isRtl: false },
];
export type LocaleConfig = (typeof LOCALES_CONFIG)[number];