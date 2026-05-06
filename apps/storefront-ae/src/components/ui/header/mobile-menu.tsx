"use client"

import Link from "next/link"
import {User, X} from "lucide-react"
import {NavLeftContent} from "@fragrance/shared"
import {isRTL, Locale} from "@/config/i18n";
import {translate, UI_STRING} from "@/config/translations";

type MobileMenuProps = {
    content: NavLeftContent
    locale: Locale
    isOpen: boolean
    onClose: () => void
}

export default function MobileMenu({ content, locale, isOpen, onClose }: MobileMenuProps) {

    const rtl = isRTL(locale)
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 z-50 h-full w-72 bg-background shadow-xl transition-transform duration-300 ease-in-out md:hidden
        ${rtl ? "right-0" : "left-0"}
        ${rtl
                    ? isOpen ? "translate-x-0" : "translate-x-full"
                    : isOpen ? "translate-x-0" : "-translate-x-full"
                }`
                }
            >
                {/* Drawer Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                    <span className="text-sm font-medium text-foreground">{translate(UI_STRING.MENU, locale)}</span>
                    <button
                        onClick={onClose}
                        className="text-foreground/80 hover:text-foreground transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col px-4 py-6 gap-1">
                    {content.links.map((link) => (
                        <Link
                            key={link.href}
                            href={`/${locale}${link.href}`}
                            onClick={onClose}
                            className="py-3 text-base text-foreground/80 hover:text-foreground transition-colors border-b border-border/50"
                        >
                            {link.label[locale as "en" | "ar"]}
                        </Link>
                    ))}
                </nav>

                {/* Account at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <Link
                        href={`/${locale}/login`}
                        onClick={onClose}
                        className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors"
                    >
                        <User size={18} />
                        <span>{translate(UI_STRING.LOGIN, locale)}</span>
                    </Link>
                </div>
            </div>
        </>
    )
}