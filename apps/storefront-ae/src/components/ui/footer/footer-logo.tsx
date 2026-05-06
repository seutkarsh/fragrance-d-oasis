"use client"

import Image from "next/image"
import Link from "next/link"
import { FooterLogoContent } from "@fragrance/shared"
import { useLocale } from "@/hooks/use-locale"

type FooterLogoProps = {
    content: FooterLogoContent
}

export default function FooterLogo({ content }: FooterLogoProps) {
    const locale = useLocale()

    return (
        <Link href={`/${locale}${content.href}`} className="inline-flex">
            <Image
                src={content.src}
                alt={content.alt[locale]}
                width={0}
                height={0}
                sizes="100vw"
                className="h-10 lg:h-16 w-auto object-contain"
            />
        </Link>
    )
}