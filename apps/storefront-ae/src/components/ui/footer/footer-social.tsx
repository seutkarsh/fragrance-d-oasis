"use client"

import {RiInstagramLine,RiFacebookLine,RiYoutubeLine} from "react-icons/ri"
import { useRouter, usePathname } from "next/navigation"
import { FooterSocialContent } from "@fragrance/shared"
import { useLocale } from "@/hooks/use-locale"
import { LOCALE_LABELS } from "@/config/i18n"

type FooterSocialProps = {
    content: FooterSocialContent
}

const SOCIAL_ICON_MAP = {
    instagram: RiInstagramLine,
    facebook: RiFacebookLine,
    youtube: RiYoutubeLine,
}

export default function FooterSocial({ content }: FooterSocialProps) {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    function switchLocale(targetLocale: string) {
        const newPath = pathname.replace(`/${locale}`, `/${targetLocale}`)
        router.replace(newPath)
    }

    const year = new Date().getFullYear()

    return (
        <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">

            <p className="text-xs text-white/40">
                © {year}, {content.copyright[locale]}
            </p>

            <div className="flex items-center gap-6">

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        {content.icons.map((icon) => {
                            const Icon = SOCIAL_ICON_MAP[icon.id]
                            if (!Icon) return null
                            return (
                                <a key={icon.id}
                            href={icon.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-white transition-colors"
                                >
                                <Icon size={18} />
                        </a>
                        )
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-sm">
                    {Object.entries(LOCALE_LABELS).map(([loc, label], index) => (
                        <span key={loc} className="flex items-center gap-1">
                            {index > 0 && (
                                <span className="text-white/20">|</span>
                            )}
                            <button
                                onClick={() => switchLocale(loc)}
                                className={
                                    locale === loc
                                        ? "text-gold font-medium transition-colors"
                                        : "text-white/40 hover:text-white transition-colors"
                                }
                            >
                                {label}
                            </button>
                        </span>
                    ))}
                </div>

            </div>
        </div>
    )
}