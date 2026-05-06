import {SDUI_LAYOUT} from "../enum";

export type SduiBlock<T extends SDUI_LAYOUT=SDUI_LAYOUT> = {
    id:string
    layout:T
    content:T extends keyof SduiBlockContentMap ? SduiBlockContentMap[T] : Record<string, unknown>
    sort_order:number
}

export type SduiPageResponse = {
    blocks:SduiBlock[]
}


export type LocalizedString={
    en:string
    ar:string
}

export type Link={
    label:LocalizedString
    href:string
}

export type Image={
    src:string
    alt:LocalizedString
    href:string
}

export type Icon ={
    id:string
    tooltip:LocalizedString
}

export type ButtonAction =
    | { type: "link"; href: string }
    | { type: "api"; route: string; method: "GET" | "POST" | "PUT" | "DELETE" }
    | { type: "event"; name: string }

export type ButtonIcon = {
    name: string
    side: "left" | "right"
}

export type Button = {
    label: LocalizedString
    action: ButtonAction
    icon?: ButtonIcon
    variant?: "primary" | "secondary" | "ghost" | "outline"
}
//Nav Bar

export type NavLeftContent={
    links:Link[],
}
export type NavRightContent={
    icons:Icon[],
}
export type NavLogoContent=Image



export type SduiBlockContentMap = {
    [SDUI_LAYOUT.NAV_LEFT]: NavLeftContent
    [SDUI_LAYOUT.NAV_LOGO]: NavLogoContent
    [SDUI_LAYOUT.NAV_RIGHT]: NavRightContent
    [SDUI_LAYOUT.FOOTER_NEWSLETTER]:FooterNewsletterContent
    [SDUI_LAYOUT.FOOTER_LINKS_COLUMN]:FooterLinksColumnContent
    [SDUI_LAYOUT.FOOTER_SOCIAL]:FooterSocialContent
    [SDUI_LAYOUT.FOOTER_LOGO]:FooterLogoContent
}


// Footer



export type FooterNewsletterContent={
    tagline:LocalizedString
    placeholder:LocalizedString
    button:Button
}
export type FooterLogoContent=Image
export type FooterLinksColumnContent={
    heading:LocalizedString
    links:Link[]
}
export type FooterSocialContent={
    icons:{
        id: 'instagram' | 'facebook' | 'youtube'
        href:string
    }[]
    copyright: LocalizedString
}

