import {NavLeftContent} from "@fragrance/shared";
import Link from "next/link";
import {useLocale} from "@/hooks/use-locale";


type NavLeftProps = {
    content:NavLeftContent
}

export default function NavLeft({content}: NavLeftProps) {
    const locale = useLocale()

    return(
        <nav className="hidden items-center gap-6 md:flex">
            {content.links.map(link => (
                <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                >
                    {link.label[locale]}
                </Link>
            ))}
        </nav>
    )
}