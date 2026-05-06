import { prisma } from "@fragrance/database";
import { MedusaAdminAuthResponse, MedusaProduct, MedusaProductsResponse} from "@fragrance/shared";
import {logger} from "@fragrance/shared/logger"
import { env } from "../config/env";

// ─── Dev Test Data Config ─────────────────────────────────────────────────────

const DEV_PRODUCTS = [
    {
        handle: "test-perfume",
        translations: {
            en: {
                name: "Test Perfume",
                short_description: "A luxurious test fragrance",
                description: "A rich and complex fragrance crafted for testing purposes. Notes of oud, rose, and amber.",
                features: {
                    notes: ["Oud", "Rose", "Amber"],
                    concentration: "Eau de Parfum",
                    longevity: "8-10 hours",
                },
                meta_title: "Test Perfume | Fragrance D Oasis",
                meta_description: "Shop Test Perfume at Fragrance D Oasis. A luxurious oud fragrance.",
            },
            ar: {
                name: "عطر تجريبي",
                short_description: "عطر فاخر للاختبار",
                description: "عطر غني ومعقد مصنوع لأغراض الاختبار. نوتات العود والورد والعنبر.",
                features: {
                    notes: ["عود", "ورد", "عنبر"],
                    concentration: "أو دو بارفان",
                    longevity: "٨-١٠ ساعات",
                },
                meta_title: "عطر تجريبي | فراغرانس دي أواسيس",
                meta_description: "تسوق عطر تجريبي في فراغرانس دي أواسيس.",
            },
        },
        options: [
            {
                medusaTitle: "Size",
                translations: {
                    en: "Size",
                    ar: "الحجم",
                },
                values: [
                    {
                        medusaValue: "50ml",
                        translations: { en: "50ml", ar: "٥٠ مل" },
                    },
                    {
                        medusaValue: "100ml",
                        translations: { en: "100ml", ar: "١٠٠ مل" },
                    },
                ],
            },
            {
                medusaTitle: "Color",
                translations: {
                    en: "Color",
                    ar: "اللون",
                },
                values: [
                    {
                        medusaValue: "Red",
                        translations: { en: "Red", ar: "أحمر" },
                    },
                    {
                        medusaValue: "Blue",
                        translations: { en: "Blue", ar: "أزرق" },
                    },
                ],
            },
        ],
        images: [
            {
                url: "https://placehold.co/800x800?text=Test+Perfume",
                alt_text: "Test Perfume bottle",
                variant_sku: null,
                sort_order: 0,
            },
            {
                url: "https://placehold.co/800x800?text=50ml+Red",
                alt_text: "Test Perfume 50ml Red",
                variant_sku: "TEST-PERF-50-RED",
                sort_order: 1,
            },
            {
                url: "https://placehold.co/800x800?text=50ml+Blue",
                alt_text: "Test Perfume 50ml Blue",
                variant_sku: "TEST-PERF-50-BLUE",
                sort_order: 2,
            },
            {
                url: "https://placehold.co/800x800?text=100ml+Red",
                alt_text: "Test Perfume 100ml Red",
                variant_sku: "TEST-PERF-100-RED",
                sort_order: 3,
            },
            {
                url: "https://placehold.co/800x800?text=100ml+Blue",
                alt_text: "Test Perfume 100ml Blue",
                variant_sku: "TEST-PERF-100-BLUE",
                sort_order: 4,
            },
        ],
    },
];

const DEV_CATEGORIES = [
    {
        handle: "fragrances",
        sort_order: 0,
        translations: {
            en: { name: "Fragrances", description: "All fragrances" },
            ar: { name: "العطور", description: "جميع العطور" },
        },
        children: [
            {
                handle: "oud",
                sort_order: 0,
                translations: {
                    en: { name: "Oud", description: "Oud based fragrances" },
                    ar: { name: "عود", description: "عطور العود" },
                },
            },
        ],
    },
];

const DEV_SDUI_NAV = {
    slug: "nav",
    title: "Navigation",
    blocks: [
        {
            id: "dev-nav-left",
            layout: "NavLeft",
            sort_order: 0,
            content: {
                links: [
                    { label: { en: "Collections", ar: "المجموعات" }, href: "/collections" },
                    { label: { en: "About", ar: "من نحن" }, href: "/about" },
                    { label: { en: "Blogs", ar: "المدونة" }, href: "/blogs" },
                    { label: { en: "Gifts", ar: "الهدايا" }, href: "/gifts" },
                    { label: { en: "Contact Us", ar: "تواصل معنا" }, href: "/contact" },
                ],
            },
        },
        {
            id: "dev-nav-logo",
            layout: "NavLogo",
            sort_order: 1,
            content: {
                src: "/logo.png",
                alt: { en: "Fragrance d'Oasis", ar: "فراغرانس دي أواسيس" },
                href: "/",
            },
        },
        {
            id: "dev-nav-right",
            layout: "NavRight",
            sort_order: 2,
            content: {
                icons: [
                    { id: "wishlist", tooltip: { en: "Wishlist", ar: "قائمة الأمنيات" } },
                    { id: "cart", tooltip: { en: "Cart", ar: "عربة التسوق" } },
                    { id: "account", tooltip: { en: "Account", ar: "حسابي" } },
                ],
            },
        },
    ],
}

const DEV_SDUI_FOOTER = {
    slug: "footer",
    title: "Footer",
    blocks: [
        {
            id: "dev-footer-logo",
            layout: "FooterLogo",
            sort_order: 0,
            content: {
                src: "/logo.png",
                alt: { en: "Fragrance d'Oasis", ar: "فراغرانس دي أواسيس" },
                href: "/",
            },
        },
        {
            id: "dev-footer-newsletter",
            layout: "FooterNewsletter",
            sort_order: 1,
            content: {
                tagline: {
                    en: "Exclusive product launches, offers, VIP invites",
                    ar: "إطلاق منتجات حصرية، عروض، ودعوات VIP",
                },
                placeholder: {
                    en: "Enter your email",
                    ar: "أدخل بريدك الإلكتروني",
                },
                button: {
                    label: { en: "Sign Up", ar: "اشترك" },
                    action: { type: "event", name: "submit-newsletter" },
                    variant: "outline",
                },
            },
        },
        {
            id: "dev-footer-links-quick",
            layout: "FooterLinksColumn",
            sort_order: 2,
            content: {
                heading: { en: "Quick Links", ar: "روابط سريعة" },
                links: [
                    { label: { en: "Shop", ar: "تسوق" }, href: "/collections" },
                    { label: { en: "About Us", ar: "من نحن" }, href: "/about" },
                    { label: { en: "Blogs", ar: "المدونة" }, href: "/blogs" },
                ],
            },
        },
        {
            id: "dev-footer-links-help",
            layout: "FooterLinksColumn",
            sort_order: 3,
            content: {
                heading: { en: "Can We Help?", ar: "هل يمكننا المساعدة؟" },
                links: [
                    { label: { en: "Shipping Policy", ar: "سياسة الشحن" }, href: "/shipping-policy" },
                    { label: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, href: "/privacy-policy" },
                    { label: { en: "Terms & Conditions", ar: "الشروط والأحكام" }, href: "/terms" },
                    { label: { en: "Return & Refund Policy", ar: "سياسة الإرجاع والاسترداد" }, href: "/returns" },
                    { label: { en: "FAQs", ar: "الأسئلة الشائعة" }, href: "/faqs" },
                ],
            },
        },
        {
            id: "dev-footer-links-contact",
            layout: "FooterLinksColumn",
            sort_order: 4,
            content: {
                heading: { en: "Talk With Us", ar: "تحدث معنا" },
                links: [
                    { label: { en: "Contact Us", ar: "تواصل معنا" }, href: "/contact" },
                    { label: { en: "Email", ar: "البريد الإلكتروني" }, href: "mailto:hello@fodubai.com" },
                ],
            },
        },
        {
            id: "dev-footer-social",
            layout: "FooterSocial",
            sort_order: 5,
            content: {
                icons: [
                    { id: "instagram", href: "https://instagram.com/fragrancedoasis" },
                    { id: "facebook", href: "https://facebook.com/fragrancedoasis" },
                    { id: "youtube", href: "https://youtube.com/fragrancedoasis" },
                ],
                copyright: {
                    en: "Fragrance d'Oasis Dubai",
                    ar: "© ٢٠٢٦، فراغرانس دي أواسيس دبي",
                },
            },
        },
    ],
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getMedusaToken(): Promise<string> {
    const res = await fetch(`${env.MEDUSA_BACKEND_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: env.SEED_ADMIN_EMAIL,
            password: env.SEED_ADMIN_PASSWORD,
        }),
    });

    if (!res.ok) {
        throw new Error(`Medusa auth failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as MedusaAdminAuthResponse;
    if (!data.token) throw new Error("Medusa auth response missing token");
    return data.token;
}

// ─── Fetch product from Medusa ────────────────────────────────────────────────

async function getMedusaProduct(
    token: string,
    handle: string
): Promise<MedusaProduct | null> {
    const res = await fetch(
        `${env.MEDUSA_BACKEND_URL}/admin/products?handle=${handle}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as MedusaProductsResponse;
    return data.products[0] ?? null;
}

// ─── Seed categories ──────────────────────────────────────────────────────────

async function seedCategories(): Promise<void> {
    logger.info("Seeding dev categories...");

    for (const cat of DEV_CATEGORIES) {
        const parent = await prisma.category.upsert({
            where: { handle: cat.handle },
            update: { sort_order: cat.sort_order, is_active: true },
            create: { handle: cat.handle, sort_order: cat.sort_order, is_active: true },
        });

        await Promise.all(
            Object.entries(cat.translations).map(async ([locale, t]) => {
                await prisma.categoryTranslation.upsert({
                    where: {
                        category_id_locale_code: {
                            category_id: parent.id,
                            locale_code: locale,
                        },
                    },
                    update: { name: t.name, description: t.description },
                    create: {
                        category_id: parent.id,
                        locale_code: locale,
                        name: t.name,
                        description: t.description,
                    },
                });
            })
        );

        logger.info(`Upserted category: ${cat.handle}`);

        for (const child of cat.children) {
            const childCat = await prisma.category.upsert({
                where: { handle: child.handle },
                update: { sort_order: child.sort_order, is_active: true, parent_id: parent.id },
                create: {
                    handle: child.handle,
                    sort_order: child.sort_order,
                    is_active: true,
                    parent_id: parent.id,
                },
            });

            await Promise.all(
                Object.entries(child.translations).map(async ([locale, t]) => {
                    await prisma.categoryTranslation.upsert({
                        where: {
                            category_id_locale_code: {
                                category_id: childCat.id,
                                locale_code: locale,
                            },
                        },
                        update: { name: t.name, description: t.description },
                        create: {
                            category_id: childCat.id,
                            locale_code: locale,
                            name: t.name,
                            description: t.description,
                        },
                    });
                })
            );

            logger.info(`Upserted child category: ${child.handle}`);
        }
    }
}

// ─── Seed product data ────────────────────────────────────────────────────────

async function seedProducts(token: string): Promise<void> {
    logger.info("Seeding dev product data...");

    // Get UAE region from our custom table
    const region = await prisma.region.findUnique({ where: { code: "ae" } });
    if (!region) {
        throw new Error("UAE region not found in custom.regions — run seed-bootstrap first");
    }

    for (const productConfig of DEV_PRODUCTS) {
        const medusaProduct = await getMedusaProduct(token, productConfig.handle);

        if (!medusaProduct) {
            logger.warn(
                `Product "${productConfig.handle}" not found in Medusa — skipping. Create it first.`
            );
            continue;
        }

        const productId = medusaProduct.id;
        logger.info(`Processing product: ${productConfig.handle} (${productId})`);

        // 1 — Product translations
        await Promise.all(
            Object.entries(productConfig.translations).map(async ([locale, t]) => {
                await prisma.productTranslation.upsert({
                    where: {
                        product_id_locale_code: {
                            product_id: productId,
                            locale_code: locale,
                        },
                    },
                    update: {
                        name: t.name,
                        short_description: t.short_description,
                        description: t.description,
                        features: t.features,
                        meta_title: t.meta_title,
                        meta_description: t.meta_description,
                    },
                    create: {
                        product_id: productId,
                        locale_code: locale,
                        name: t.name,
                        short_description: t.short_description,
                        description: t.description,
                        features: t.features,
                        meta_title: t.meta_title,
                        meta_description: t.meta_description,
                    },
                });
                logger.info(`Upserted product translation: ${locale}`);
            })
        );

        // 2 — Option + option value translations
        for (const optionConfig of productConfig.options) {
            const medusaOption = medusaProduct.options.find(
                (o) => o.title === optionConfig.medusaTitle
            );

            if (!medusaOption) {
                logger.warn(`Option "${optionConfig.medusaTitle}" not found — skipping`);
                continue;
            }

            await Promise.all(
                Object.entries(optionConfig.translations).map(async ([locale, name]) => {
                    await prisma.productOptionTranslation.upsert({
                        where: {
                            option_id_locale_code: {
                                option_id: medusaOption.id,
                                locale_code: locale,
                            },
                        },
                        update: { name },
                        create: { option_id: medusaOption.id, locale_code: locale, name },
                    });
                })
            );

            logger.info(`Upserted option translations: ${optionConfig.medusaTitle}`);

            for (const valueConfig of optionConfig.values) {
                const medusaValue = medusaOption.values.find(
                    (v) => v.value === valueConfig.medusaValue
                );

                if (!medusaValue) {
                    logger.warn(`Option value "${valueConfig.medusaValue}" not found — skipping`);
                    continue;
                }

                await Promise.all(
                    Object.entries(valueConfig.translations).map(async ([locale, label]) => {
                        await prisma.productOptionValueTranslation.upsert({
                            where: {
                                option_value_id_locale_code: {
                                    option_value_id: medusaValue.id,
                                    locale_code: locale,
                                },
                            },
                            update: { label },
                            create: {
                                option_value_id: medusaValue.id,
                                locale_code: locale,
                                label,
                            },
                        });
                    })
                );

                logger.info(`Upserted option value translations: ${valueConfig.medusaValue}`);
            }
        }

        // 3 — Variant regional availability
        await Promise.all(
            medusaProduct.variants.map(async (variant) => {
                await prisma.productVariantRegionAvailability.upsert({
                    where: {
                        variant_id_region_id: {
                            variant_id: variant.id,
                            region_id: region.id,
                        },
                    },
                    update: { is_available: true },
                    create: {
                        variant_id: variant.id,
                        region_id: region.id,
                        is_available: true,
                    },
                });
                logger.info(`Upserted variant availability: ${variant.sku} → ae`);
            })
        );

        // 4 — Images
        await Promise.all(
            productConfig.images.map(async (image, index) => {
                const variantId = image.variant_sku
                    ? medusaProduct.variants.find((v) => v.sku === image.variant_sku)?.id ?? null
                    : null;

                await prisma.productImage.upsert({
                    where: { id: `dev-img-${productId}-${index}` },
                    update: {
                        url: image.url,
                        alt_text: image.alt_text,
                        variant_id: variantId,
                        sort_order: image.sort_order,
                    },
                    create: {
                        id: `dev-img-${productId}-${index}`,
                        product_id: productId,
                        variant_id: variantId,
                        url: image.url,
                        alt_text: image.alt_text,
                        sort_order: image.sort_order,
                    },
                });
                logger.info(`Upserted image: ${image.alt_text}`);
            })
        );

        // 5 — Link product to category
        const oudCategory = await prisma.category.findUnique({
            where: { handle: "oud" },
        });

        if (oudCategory) {
            await prisma.productCategory.upsert({
                where: {
                    product_id_category_id: {
                        product_id: productId,
                        category_id: oudCategory.id,
                    },
                },
                update: {},
                create: {
                    product_id: productId,
                    category_id: oudCategory.id,
                },
            });
            logger.info(`Linked product to category: oud`);
        }
    }
}

// ----------Seed SDUI ----------------

async function seedSdui(): Promise<void> {
    logger.info("Seeding dev SDUI data...")

    for (const pageData of [DEV_SDUI_NAV, DEV_SDUI_FOOTER]) {
        const page = await prisma.sduiPage.upsert({
            where: { slug: pageData.slug },
            update: { title: pageData.title, is_active: true },
            create: { slug: pageData.slug, title: pageData.title, is_active: true },
        })

        await Promise.all(pageData.blocks.map(async (block) => {
            await prisma.sduiBlock.upsert({
                where: { id: block.id },
                update: {
                    layout: block.layout,
                    content: block.content,
                    sort_order: block.sort_order,
                    is_active: true,
                },
                create: {
                    id: block.id,
                    page_id: page.id,
                    layout: block.layout,
                    content: block.content,
                    sort_order: block.sort_order,
                    is_active: true,
                },
            })
            logger.info(`Upserted SDUI block: ${block.layout}`)
        }))

        logger.info(`Seeded SDUI page: ${pageData.slug}`)
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    logger.info("Starting dev seed...");

    try {
        const token = await getMedusaToken();
        await seedCategories();
        await seedProducts(token);
        await seedSdui();
        logger.info("Dev seed completed successfully ✓");
    } catch (error) {
        logger.error(error, "Dev seed failed");
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

export default async function () {
    await main();
}