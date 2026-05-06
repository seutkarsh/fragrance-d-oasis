"use client"

import { useState } from "react"
import { FooterNewsletterContent } from "@fragrance/shared"
import { useLocale } from "@/hooks/use-locale"
import { UI_STRING, translate } from "@/config/translations"

type FooterNewsletterProps = {
    content: FooterNewsletterContent
}

export default function FooterNewsletter({ content }: FooterNewsletterProps) {
    const locale = useLocale()
    const [email, setEmail] = useState("")

    function handleSubmit() {
        // TODO: wire up newsletter API
        console.log("Newsletter signup:", email)
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-white/60">
                {content.tagline[locale]}
            </p>
            <div className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={content.placeholder[locale]}
                    className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold"
                />
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm border border-gold text-gold hover:bg-gold hover:text-background transition-colors rounded"
                >
                    {content.button.label[locale]}
                </button>
            </div>
        </div>
    )
}