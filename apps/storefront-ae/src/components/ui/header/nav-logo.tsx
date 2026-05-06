"use client"

import Image from "next/image"
import Link from "next/link"
import { NavLogoContent } from "@fragrance/shared"
import {useLocale} from "@/hooks/use-locale";

type NavLogoProps = {
    content: NavLogoContent
}

export default function NavLogo({ content }: NavLogoProps) {
    const locale = useLocale()

    return (
        <Link href={`/${locale}${content.href}`} className="flex items-center">
            <Image
                src={content.src}
                alt={content.alt[locale]}
                width={0}
                height={0}
                sizes="100vw"
                priority
                className="h-10 w-auto md:h-12 lg:h-14 object-contain"
            />
        </Link>
    )
}