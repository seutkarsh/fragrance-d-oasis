"use client"

import Link from "next/link"
import { FooterLinksColumnContent } from "@fragrance/shared"
import { useLocale } from "@/hooks/use-locale"

type FooterLinksColumnProps = {
    content: FooterLinksColumnContent
}

export default function FooterLinksColumn({ content }: FooterLinksColumnProps) {
    const locale = useLocale()

    return (
        <div className="flex flex-col gap-4">
            <h4 className="text-sm font-medium text-white">
                {content.heading[locale]}
            </h4>
            <ul className="flex flex-col gap-3">
                {content.links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={`/${locale}${link.href}`}
                            className="text-sm text-white/60 hover:text-white transition-colors"
                        >
                            {link.label[locale]}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}