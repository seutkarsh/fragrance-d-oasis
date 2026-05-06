import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CategoryCustomQuerySchema } from "@fragrance/shared";
import {logger} from "@fragrance/shared/logger"
import { prisma } from "@fragrance/database";

type CategoryNode = {
    id: string;
    handle: string;
    sort_order: number;
    translation: {
        name: string;
        description: string | null;
    } | null;
    children: CategoryNode[];
};

function buildTree(
    categories: {
        id: string;
        handle: string;
        parent_id: string | null;
        sort_order: number;
        translations: { name: string; description: string | null }[];
    }[]
): CategoryNode[] {
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    categories.forEach((cat) => {
        map.set(cat.id, {
            id: cat.id,
            handle: cat.handle,
            sort_order: cat.sort_order,
            translation: cat.translations[0] ?? null,
            children: [],
        });
    });

    categories.forEach((cat) => {
        const node = map.get(cat.id)!;
        if (cat.parent_id && map.has(cat.parent_id)) {
            map.get(cat.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    const sortNodes = (nodes: CategoryNode[]) => {
        nodes.sort((a, b) => a.sort_order - b.sort_order);
        nodes.forEach((n) => sortNodes(n.children));
    };
    sortNodes(roots);

    return roots;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const queryResult = CategoryCustomQuerySchema.safeParse({
        region_id: (req as any).customQuery?.region_id,
        locale: (req as any).customQuery?.locale,
    });

    if (!queryResult.success) {
        return res.status(400).json({
            error: "Invalid query params",
            details: queryResult.error.flatten().fieldErrors,
        });
    }

    const { locale, region_id } = queryResult.data;

    try {
        // Step 1 — Resolve our internal region id from Medusa region id
        const region = await prisma.region.findUnique({
            where: { medusa_region_id: region_id },
        });

        if (!region) {
            return res.status(404).json({
                error: `Region not found for region_id: ${region_id}`,
            });
        }

        // Step 2 — Get category IDs that have at least one available variant
        // in this region using raw SQL cross-schema join
        const availableCategoryRows = await prisma.$queryRaw<{ id: string }[]>`
            WITH RECURSIVE available_categories AS (
                SELECT DISTINCT c.id
                FROM custom.categories c
                         JOIN custom.product_categories pc ON pc.category_id = c.id
                         JOIN public.product_variant pv ON pv.product_id = pc.product_id
                         JOIN custom.product_variant_region_availability pvra
                              ON pvra.variant_id = pv.id
                WHERE c.is_active = true
                  AND pvra.region_id = ${region.id}
                  AND pvra.is_available = true
                  AND pv.deleted_at IS NULL
            ),
                           ancestor_categories AS (
                               SELECT c.id, c.parent_id
                               FROM custom.categories c
                               WHERE c.id IN (SELECT id FROM available_categories)

                               UNION

                               SELECT parent.id, parent.parent_id
                               FROM custom.categories parent
                                        JOIN ancestor_categories child ON child.parent_id = parent.id
                               WHERE parent.is_active = true
                           )
            SELECT DISTINCT id FROM ancestor_categories
        `;

        const availableCategoryIds = availableCategoryRows.map((r) => r.id);

        if (!availableCategoryIds.length) {
            return res.json({ categories: [] });
        }

        // Step 3 — Fetch those categories with translations
        const categories = await prisma.category.findMany({
            where: {
                id: { in: availableCategoryIds },
                is_active: true,
            },
            orderBy: { sort_order: "asc" },
            include: {
                translations: {
                    where: { locale_code: locale },
                },
            },
        });

        // Step 4 — Build nested tree
        const tree = buildTree(categories);

        logger.info(
            `Categories served [locale: ${locale}, region: ${region.code}] — ${categories.length} categories, ${tree.length} root(s)`
        );

        return res.json({ categories: tree });
    } catch (error) {
        logger.error(error, "Failed to fetch categories");
        return res.status(500).json({ error: "Internal server error" });
    }
}