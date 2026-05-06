"use client"

import Link from "next/link"
import { Heart, ShoppingCart, User } from "lucide-react"
import { NavRightContent } from "@fragrance/shared"
import {useLocale} from "@/hooks/use-locale";
import {usePathname,useRouter} from "next/navigation";
import {Locale, LOCALE_LABELS} from "@/config/i18n";

type NavRightProps = {
    content: NavRightContent
}

const ICON_MAP = {
    wishlist: Heart,
    cart: ShoppingCart,
    account: User,
}

export default function NavRight({ content }: NavRightProps) {
    const locale= useLocale()
    const router = useRouter()
    const pathname = usePathname()

    function switchLocale(targetLocale:string){
        const newPath = pathname.replace(`/${locale}`, `/${targetLocale}`)
        router.replace(newPath)
    }

    return (
        <div className="flex items-center gap-4">

            <div className="flex items-center gap-1 text-sm">
                {Object.entries(LOCALE_LABELS).map(([loc, label], index) => (
                    <span key={loc} className="flex items-center gap-1">
                        {index > 0 && <span className="text-foreground/30">|</span>}
                        <button
                            onClick={() => switchLocale(loc)}
                            className={`transition-colors ${
                                locale === loc
                                    ? "text-gold font-medium"
                                    : "text-foreground/60 hover:text-foreground"
                            }`}
                        >
                            {label}
                        </button>
                    </span>
                ))}
            </div>


            {content.icons.map((icon) => {
                const Icon = ICON_MAP[icon.id as keyof typeof ICON_MAP]
                if (!Icon) return null

                const isMobileHidden = icon.id === "account"

                return (
                    <Link
                        key={icon.id}
                        href={`/${locale}/${icon.id}`}
                        title={icon.tooltip[locale]}
                        className={`text-foreground/80 transition-colors hover:text-foreground ${isMobileHidden ? "hidden md:flex" : "flex"}`}
                    >
                        <Icon size={20} />
                        <span className="sr-only">{icon.tooltip[locale as "en" | "ar"]}</span>
                    </Link>
                )
            })}
        </div>
    )
}

//TODO: 1. User Icon Change on Login
//TODO: 2. Cart Icon needs a badge