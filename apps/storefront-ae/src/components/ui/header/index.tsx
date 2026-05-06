import { api } from "@/lib/api"
import { SDUI_LAYOUT, SDUI_SLUG, SduiBlock, SduiPageResponse } from "@fragrance/shared"
import HeaderClient from "./header-client"
import {Locale} from "@/config/i18n";

type HeaderProps = {
    locale: Locale
}

export default async function Header({ locale }: HeaderProps) {
    const { blocks } = await api.sdui.getPage<SduiPageResponse>(SDUI_SLUG.NAV, {
        cache: "force-cache",
        tags: ["sdui-nav"],
    })

    const navLeftBlock = blocks.find((b) => b.layout === SDUI_LAYOUT.NAV_LEFT) as SduiBlock<SDUI_LAYOUT.NAV_LEFT> | undefined
    const navLogoBlock = blocks.find((b) => b.layout === SDUI_LAYOUT.NAV_LOGO) as SduiBlock<SDUI_LAYOUT.NAV_LOGO> | undefined
    const navRightBlock = blocks.find((b) => b.layout === SDUI_LAYOUT.NAV_RIGHT) as SduiBlock<SDUI_LAYOUT.NAV_RIGHT> | undefined

    if (!navLeftBlock || !navLogoBlock || !navRightBlock) return null

    return (
        <header className="fixed top-0 left-0 z-50 w-full">
            <HeaderClient
                navLeftContent={navLeftBlock.content}
                navLogoContent={navLogoBlock.content}
                navRightContent={navRightBlock.content}
                locale={locale}
            />
        </header>
    )
}