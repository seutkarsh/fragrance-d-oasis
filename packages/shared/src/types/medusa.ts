export type MedusaRegion = {
    id: string;
    name: string;
    currency_code: string;
    automatic_taxes: boolean;
    countries: MedusaCountry[];
    payment_providers: MedusaPaymentProvider[];
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type MedusaCountry = {
    id: string;
    iso_2: string;
    iso_3: string;
    num_code: string;
    name: string;
    display_name: string;
    region_id: string;
};

export type MedusaPaymentProvider = {
    id: string;
    is_enabled: boolean;
};

export type MedusaRegionsResponse = {
    regions: MedusaRegion[];
    count: number;
    offset: number;
    limit: number;
};

export type MedusaAdminAuthResponse = {
    token: string;
};

export type MedusaOptionValue = {
    id: string;
    value: string;
    metadata: Record<string, unknown> | null;
    option_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type MedusaOption = {
    id: string;
    title: string;
    metadata: Record<string, unknown> | null;
    product_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    values: MedusaOptionValue[];
};

export type MedusaVariant = {
    id: string;
    title: string;
    sku: string;
    barcode: string | null;
    ean: string | null;
    upc: string | null;
    allow_backorder: boolean;
    manage_inventory: boolean;
    weight: number | null;
    length: number | null;
    height: number | null;
    width: number | null;
    metadata: Record<string, unknown> | null;
    variant_rank: number;
    thumbnail: string | null;
    product_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    options: MedusaOptionValue[];
};

export type MedusaProduct = {
    id: string;
    title: string;
    subtitle: string | null;
    status: "draft" | "published" | "archived";
    handle: string;
    description: string | null;
    is_giftcard: boolean;
    discountable: boolean;
    thumbnail: string | null;
    collection_id: string | null;
    type_id: string | null;
    weight: number | null;
    length: number | null;
    height: number | null;
    width: number | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    options: MedusaOption[];
    variants: MedusaVariant[];
};

export type MedusaProductsResponse = {
    products: MedusaProduct[];
    count: number;
    offset: number;
    limit: number;
};

export type MedusaCategoryTranslation = {
    id: string;
    category_id: string;
    locale_code: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type MedusaCategory = {
    id: string;
    handle: string;
    parent_id: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    translation: MedusaCategoryTranslation | null;
    children: MedusaCategory[];
};

export type MedusaCategoriesResponse = {
    categories: MedusaCategory[];
};