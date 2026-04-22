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