import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { isValidLocale, isRTL, DEFAULT_LOCALE } from "@/config/i18n"
import type { Locale } from "@/config/i18n"
import { LOCALES } from "@/config/i18n"
import "../globals.css"
import {QueryProvider} from "@/providers/query-provider";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
})

const playfair = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
    title: "Fragrance d'Oasis",
    description: "Beyond perfume. An identity. An aura.",
}

export function generateStaticParams(){
    return LOCALES.map((locale) => ({locale}))
}

export default async function LocaleLayout({
    children,
    params,
                                           }:{
    children:React.ReactNode;
    params:Promise<{locale:string}>
}){
    const {locale} = await params
    const validLocale:Locale = isValidLocale(locale)? locale : DEFAULT_LOCALE

    return(
        <html
        lang={validLocale}
        dir={isRTL(validLocale)?"rtl":"ltr"}
        className={`${inter.variable} ${playfair.variable}`}>
        <body className="flex min-h-screen flex-col">
        <QueryProvider>
            <Header locale={validLocale}/>
            <main className="flex-1 pt-16">
                {children}
            </main>
            <Footer/>
        </QueryProvider>
        </body>

        </html>
    )
}