import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ProductCustomQuerySchema, ProductHandleParamsSchema, logger } from "@fragrance/shared";
import { IProductModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { prisma } from "@fragrance/database";

export async function GET(req: MedusaRequest, res: MedusaResponse) {

    // ─── Validate params + query ─────────────────────────────────────────────────

    const paramResults = ProductHandleParamsSchema.safeParse(req.params);
    if (!paramResults.success) {
        return res.status(400).json({
            error: "Invalid params",
            details: paramResults.error.flatten().fieldErrors,
        });
    }

    const queryResult = ProductCustomQuerySchema.safeParse({
        region_id: req.query.region_id,
        locale: (req as any).customQuery?.locale,
    });
    if (!queryResult.success) {
        return res.status(400).json({
            error: "Invalid query params",
            details: queryResult.error.flatten().fieldErrors,
        });
    }

    const { handle } = paramResults.data;
    const { region_id, locale: locale_code } = queryResult.data;

    try {
        // ─── Step 1: Resolve product from Medusa container ───────────────────────────

        const productService = req.scope.resolve<IProductModuleService>(
            Modules.PRODUCT
        );

        const [products] = await productService.listAndCountProducts(
            { handle },
            { relations: ["options", "options.values", "variants", "variants.options"] }
        );

        if (!products || !products.length) {
            return res.status(404).json({ error: `Product not found: ${handle}` });
        }

        const product = products[0];
        const productId = product.id;

        // ─── Step 2: Resolve region + locale in parallel ──────────────────────────────

        const [region, locale] = await Promise.all([
            prisma.region.findUnique({ where: { medusa_region_id: region_id } }),
            prisma.locale.findUnique({ where: { code: locale_code } }),
        ]);

        if (!region) {
            return res.status(404).json({
                error: `Region not found for region_id: ${region_id}`,
            });
        }

        if (!locale) {
            return res.status(404).json({
                error: `Locale not found: ${locale_code}`,
            });
        }

        // ─── Step 3: Fetch all custom data in parallel ────────────────────────────────

        const optionIds = product.options.map((o) => o.id);
        const optionValueIds = product.options.flatMap((o) => o.values.map((v) => v.id));
        const variantIds = product.variants.map((v) => v.id);

        const [
            productTranslation,
            optionTranslations,
            optionValueTranslations,
            variantAvailability,
            images,
            productCategories,
        ] = await Promise.all([
            prisma.productTranslation.findUnique({
                where: {
                    product_id_locale_code: {
                        product_id: productId,
                        locale_code,
                    },
                },
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
                        include: {
                            translations: { where: { locale_code } },
                        },
                    },
                },
            }),
        ]);

        // ─── Step 4: Build availability maps ─────────────────────────────────────────

        // Available variant IDs set
        const availableVariantIds = new Set(
            variantAvailability
                .filter((v) => v.is_available)
                .map((v) => v.variant_id)
        );

        // optionValueId → [{ variant_id, sku }] map
        const optionValueToVariants = new Map<string,{ variant_id: string; sku: string }[]>();

        product.variants.forEach((variant) => {
            variant.options.forEach((optionValue) => {
                const existing = optionValueToVariants.get(optionValue.id) ?? [];
                existing.push({ variant_id: variant.id, sku: variant.sku ?? "" });
                optionValueToVariants.set(optionValue.id, existing);
            });
        });

        // ─── Step 5: Build response ───────────────────────────────────────────────────

        const response = {
            product_id: productId,
            handle,
            locale: locale_code,
            region_code: region.code,

            translation: productTranslation ?? null,

            options: product.options.map((option) => ({
                id: option.id,
                translation:
                    optionTranslations.find((t) => t.option_id === option.id) ?? null,
                values: option.values
                    .map((value) => {
                        const variants = optionValueToVariants.get(value.id) ?? [];
                        const availableVariants = variants.filter((v) =>
                            availableVariantIds.has(v.variant_id)
                        );

                        // Skip this option value entirely if no available variants
                        if (!availableVariants.length) return null;

                        return {
                            id: value.id,
                            translation:
                                optionValueTranslations.find(
                                    (t) => t.option_value_id === value.id
                                ) ?? null,
                            variants: availableVariants.map((v) => ({
                                variant_id: v.variant_id,
                                sku: v.sku,
                            })),
                        };
                    })
                    .filter((v) => v !== null),
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
        };

        logger.info(
            `Custom data served: ${handle} [locale: ${locale_code}, region: ${region.code}]`
        );

        return res.json(response);
    } catch (error) {
        logger.error(error, `Failed to fetch custom data for product: ${handle}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}