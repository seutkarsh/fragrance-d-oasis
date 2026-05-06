import type { Locale } from "@/config/i18n"

export default async function HomePage({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    return (
        <main>

        </main>
    )
}