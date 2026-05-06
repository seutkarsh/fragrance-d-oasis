const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

type ApiOptions = {
    locale?: string
    regionId?: string
    cache?: RequestCache
    tags?: string[]
    slug?: string
}

async function apiRequest<T>(
    path: string,
    options: ApiOptions = {}
): Promise<T> {
    const { locale, regionId,slug, cache = "force-cache", tags } = options

    const url = new URL(`${BASE_URL}${path}`)
    if (locale) url.searchParams.set("locale", locale)
    if (regionId) url.searchParams.set("region_id", regionId)
    if(slug) url.searchParams.set("slug", slug)

    const res = await fetch(url.toString(), {
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
        },
        cache,
        ...(tags ? { next: { tags } } : {}),
    })

    if (!res.ok) {
        throw new Error(`API error: ${res.status} on ${path}`)
    }

    return res.json() as Promise<T>
}

export const api = {
    products: {
        getByHandle: <T>(handle: string, options: ApiOptions) =>
            apiRequest<T>(`/store/custom/products/${handle}`, options),

        list: <T>(options: ApiOptions) =>
            apiRequest<T>(`/store/custom/products`, options),
    },
    categories: {
        list: <T>(options: ApiOptions) =>
            apiRequest<T>(`/store/custom/categories`, options),
    },
    sdui:{
        getPage: <T>(slug: string, options: ApiOptions) => apiRequest<T>('/store/custom/sdui',{...options,slug}),
    }
}