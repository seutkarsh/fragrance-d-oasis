"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { NavLeftContent, NavLogoContent, NavRightContent } from "@fragrance/shared"
import NavLeft from "./nav-left"
import NavLogo from "./nav-logo"
import NavRight from "./nav-right"
import MobileMenu from "./mobile-menu"
import {Locale} from "@/config/i18n";

type HeaderClientProps = {
    navLeftContent: NavLeftContent
    navLogoContent: NavLogoContent
    navRightContent: NavRightContent
    locale: Locale
}

export default function HeaderClient({ navLeftContent, navLogoContent, navRightContent, locale }: HeaderClientProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <>
            <div className="container relative flex h-16 items-center justify-between">
                {/* Hamburger — mobile only */}
                <button
                    className="flex items-center md:hidden"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                {/* Nav Left — desktop only */}
                <div className="hidden md:flex">
                    <NavLeft content={navLeftContent} locale={locale} />
                </div>

                {/* Logo — always centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <NavLogo content={navLogoContent} locale={locale} />
                </div>

                {/* Nav Right */}
                <NavRight content={navRightContent} locale={locale} />
            </div>

            <MobileMenu
                content={navLeftContent}
                locale={locale}
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
            />
        </>
    )
}