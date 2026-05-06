import { api } from "@/lib/api"
import {
    SDUI_LAYOUT,
    SDUI_SLUG,
    SduiBlock,
    SduiPageResponse,
    FooterLogoContent,
    FooterNewsletterContent,
    FooterLinksColumnContent,
    FooterSocialContent,
} from "@fragrance/shared"
import FooterLogo from "./footer-logo"
import FooterNewsletter from "./footer-newsletter"
import FooterLinksColumn from "./footer-links-column"
import FooterSocial from "./footer-social"

export default async function Footer() {
    const { blocks } = await api.sdui.getPage<SduiPageResponse>(SDUI_SLUG.FOOTER, {
        cache: "force-cache",
        tags: ["sdui-footer"],
    })

    const logoBlock = blocks.find((b) => b.layout === SDUI_LAYOUT.FOOTER_LOGO) as SduiBlock<SDUI_LAYOUT.FOOTER_LOGO> | undefined
    const newsletterBlock = blocks.find((b) => b.layout === SDUI_LAYOUT.FOOTER_NEWSLETTER) as SduiBlock<SDUI_LAYOUT.FOOTER_NEWSLETTER> | undefined
    const linkColumns = blocks.filter((b) => b.layout === SDUI_LAYOUT.FOOTER_LINKS_COLUMN) as SduiBlock<SDUI_LAYOUT.FOOTER_LINKS_COLUMN>[]
    const socialBlock = blocks.find((b) => b.layout === SDUI_LAYOUT.FOOTER_SOCIAL) as SduiBlock<SDUI_LAYOUT.FOOTER_SOCIAL> | undefined

    if (!logoBlock || !newsletterBlock || !socialBlock) return null

    return (
        <footer className="bg-[#1A1614] text-white">
            {/* Main Footer */}
            <div className="container py-12">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
                    {/* Left — Logo + Newsletter */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <FooterLogo content={logoBlock.content} />
                        <FooterNewsletter content={newsletterBlock.content} />
                    </div>

                    {/* Right — Link Columns */}
                    {linkColumns.map((col) => (
                        <FooterLinksColumn key={col.id} content={col.content} />
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container py-4">
                    <FooterSocial content={socialBlock.content} />
                </div>
            </div>
        </footer>
    )
}