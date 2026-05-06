import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ProductCustomQuerySchema, ProductHandleParamsSchema } from "@fragrance/shared"
import { logger } from "@fragrance/shared/logger"
import { IProductModuleService } from "@medusajs/framework/types"
import {
    Modules,
    ContainerRegistrationKeys,
    remoteQueryObjectFromString,
} from "@medusajs/framework/utils"
import { prisma } from "@fragrance/database"

export async function GET(req: MedusaRequest, res: MedusaResponse) {

    // ─── Validate params + query ──────────────────────────────────────────────

    const paramResults = ProductHandleParamsSchema.safeParse(req.params)
    if (!paramResults.success) {
        return res.status(400).json({
            error: "Invalid params",
            details: paramResults.error.flatten().fieldErrors,
        })
    }

    const queryResult = ProductCustomQuerySchema.safeParse({
        region_id: req.query.region_id,
        locale: (req as any).customQuery?.locale,
    })
    if (!queryResult.success) {
        return res.status(400).json({
            error: "Invalid query params",
            details: queryResult.error.flatten().fieldErrors,
        })
    }

    const { handle } = paramResults.data
    const { region_id, locale: locale_code } = queryResult.data

    try {
        // ─── Step 1: Resolve product from Medusa ──────────────────────────────

        const productService = req.scope.resolve<IProductModuleService>(Modules.PRODUCT)

        const [products] = await productService.listAndCountProducts(
            { handle },
            { relations: ["options", "options.values", "variants", "variants.options"] }
        )

        if (!products?.length) {
            return res.status(404).json({ error: `Product not found: ${handle}` })
        }

        const product = products[0]
        const productId = product.id

        // After resolving the product in Step 1, add this:
        const regionModuleService = req.scope.resolve(Modules.REGION)
        const medusaRegion = await regionModuleService.retrieveRegion(region_id)
        // ─── Step 2: Resolve region + locale ──────────────────────────────────

        const [region, locale] = await Promise.all([
            prisma.region.findUnique({ where: { medusa_region_id: region_id } }),
            prisma.locale.findUnique({ where: { code: locale_code } }),
        ])

        if (!region) return res.status(404).json({ error: `Region not found: ${region_id}` })
        if (!locale) return res.status(404).json({ error: `Locale not found: ${locale_code}` })

        // ─── Step 3: Fetch all custom data + prices in parallel ───────────────

        const optionIds = product.options.map((o) => o.id)
        const optionValueIds = product.options.flatMap((o) => o.values.map((v) => v.id))
        const variantIds = product.variants.map((v) => v.id)

        // Resolve remoteQuery once — the actual query goes into the parallel block
        const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

        const priceQuery = remoteQueryObjectFromString({
            entryPoint: "variant",
            variables: {
                filters: { id: variantIds },
                calculated_price: {
                    // region_id here is the Medusa region ID from the request
                    // Medusa uses this to pick the correct price + currency
                    context: { region_id,currency_code: medusaRegion.currency_code }

                },
            },
            fields: [
                "id",
                "calculated_price.calculated_amount",
                "calculated_price.original_amount",
                "calculated_price.currency_code",
                "calculated_price.calculated_price_type",
            ],
        })

        const [
            productTranslation,
            optionTranslations,
            optionValueTranslations,
            variantAvailability,
            images,
            productCategories,
            variantsWithPrices,  // ← new
        ] = await Promise.all([
            prisma.productTranslation.findUnique({
                where: { product_id_locale_code: { product_id: productId, locale_code } },
            }),
            prisma.productOptionTranslation.findMany({
                where: { locale_code, option_id: { in: optionIds } },
            }),
            prisma.productOptionValueTranslation.findMany({
                where: { locale_code, option_value_id: { in: optionValueIds } },
            }),
            prisma.productVariantRegionAvailability.findMany({
                where: { region_id: region.id, variant_id: { in: variantIds } },
            }),
            prisma.productImage.findMany({
                where: { product_id: productId },
                orderBy: { sort_order: "asc" },
            }),
            prisma.productCategory.findMany({
                where: { product_id: productId },
                include: {
                    category: {
                        include: { translations: { where: { locale_code } } },
                    },
                },
            }),
            remoteQuery(priceQuery), // ← new
        ])

        // ─── Step 4: Build maps ───────────────────────────────────────────────

        // Region gate — only variants explicitly marked available for this region
        const availableVariantIds = new Set(
            variantAvailability
                .filter((v) => v.is_available)
                .map((v) => v.variant_id)
        )

        // optionValueId → optionId
        // Needed to build the { optionId: optionValueId } combination map per variant
        const optionValueToOptionId = new Map<string, string>()
        product.options.forEach((option) => {
            option.values.forEach((value) => {
                optionValueToOptionId.set(value.id, option.id)
            })
        })

        // optionValueId → [{ variant_id, sku }]
        // Used to build the options selector (which variants does each option value map to)
        const optionValueToVariants = new Map<string, { variant_id: string; sku: string }[]>()
        product.variants.forEach((variant) => {
            variant.options.forEach((optionValue) => {
                const existing = optionValueToVariants.get(optionValue.id) ?? []
                existing.push({ variant_id: variant.id, sku: variant.sku ?? "" })
                optionValueToVariants.set(optionValue.id, existing)
            })
        })

        // variantId → price
        // compare_at_price only populated when Medusa returns a sale price
        // i.e. a price list of type "sale" is active for this region
        const variantPriceMap = new Map<string,
            {
            amount: number,
            currency_code: string,
            compare_at_price: number | null
        }>();
        (variantsWithPrices as any[]).forEach((v) => {
            const cp = v.calculated_price
            if (!cp) return
            variantPriceMap.set(v.id, {
                amount: cp.calculated_amount,
                currency_code: cp.currency_code,
                compare_at_price: cp.calculated_price_type === "sale" ? cp.original_amount : null,
            })
        })

        // ─── Step 5: Build response ───────────────────────────────────────────

        const response = {
            product_id: productId,
            handle,
            locale: locale_code,
            region_code: region.code,

            translation: productTranslation ?? null,

            // Flat variants array
            // Frontend uses this to:
            //   1. Resolve selected option combo → variant
            //   2. Display price for resolved variant
            //   3. Show in_stock state per variant
            variants: product.variants
                .filter((v) => availableVariantIds.has(v.id))
                .map((variant) => {
                    const optionCombination: Record<string, string> = {}
                    variant.options.forEach((optionValue) => {
                        const optionId = optionValueToOptionId.get(optionValue.id)
                        if (optionId) optionCombination[optionId] = optionValue.id
                    })

                    return {
                        id: variant.id,
                        sku: variant.sku ?? null,
                        options: optionCombination,
                        price: variantPriceMap.get(variant.id) ?? null,
                        in_stock: true, // TODO: wire Medusa inventory module
                    }
                }),

            // Options array
            // Frontend uses this to render each option selector
            // Only values with at least one available variant are included
            options: product.options.map((option) => ({
                id: option.id,
                translation: optionTranslations.find((t) => t.option_id === option.id) ?? null,
                values: option.values
                    .map((value) => {
                        const variants = optionValueToVariants.get(value.id) ?? []
                        const availableVariants = variants.filter((v) =>
                            availableVariantIds.has(v.variant_id)
                        )
                        if (!availableVariants.length) return null

                        return {
                            id: value.id,
                            translation:
                                optionValueTranslations.find(
                                    (t) => t.option_value_id === value.id
                                ) ?? null,
                            variants: availableVariants,
                        }
                    })
                    .filter(Boolean),
            })),

            images: images.map((img) => ({
                id: img.id,
                url: img.url,
                alt_text: img.alt_text,
                variant_id: img.variant_id ?? null,
                sort_order: img.sort_order,
            })),

            categories: productCategories.map((pc) => ({
                id: pc.category.id,
                handle: pc.category.handle,
                translation: pc.category.translations[0] ?? null,
            })),
        }

        logger.info(`PDP served: ${handle} [locale: ${locale_code}, region: ${region.code}]`)
        return res.json(response)

    } catch (error) {
        logger.error(error, `Failed to fetch PDP: ${handle}`)
        return res.status(500).json({ error: "Internal server error" })
    }
}