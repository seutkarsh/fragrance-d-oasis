import {
    LOCALES_CONFIG,
    REGIONS_CONFIG,
    SEED_ERROR,
    MedusaAdminAuthResponse,
    MedusaRegionsResponse
} from "@fragrance/shared"
import {logger} from "@fragrance/shared/logger"
import {prisma} from "@fragrance/database"
import {env} from '../config/env'

// ------- Step 1: Get Medusa Admin JWT -------------------

async function getMedusaToken():Promise<string> {
    logger.info("Authenticating with Medusa admin...")

    const res = await fetch(`${env.MEDUSA_BACKEND_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email:env.SEED_ADMIN_EMAIL,
            password:env.SEED_ADMIN_PASSWORD,
        })
    })

    if(!res.ok){
        throw new Error(
            `Medusa auth failed: ${res.status} ${res.statusText}`
        )
    }

    const data = await res.json() as MedusaAdminAuthResponse
    if(!data.token){
        throw new Error(SEED_ERROR.MEDUSA_RESPONSE_MISSING_TOKEN)
    }

    logger.info("Authenticating with Medusa admin successful")
    return data.token;
}

async function getMedusaRegionMap(token:string):Promise<Record<string, string>> {
    logger.info("Fetching Medusa regions...")

    const res= await fetch(`${env.MEDUSA_BACKEND_URL}/admin/regions`, {
        headers: {Authorization: `Bearer ${token}`},
    })
    if(!res.ok){
        throw new Error(
            `Failed to fetch Medusa regions: ${res.status} ${res.statusText}`
        )
    }
    const data = await res.json() as MedusaRegionsResponse;

    if(!data.regions || !Array.isArray(data.regions)){
        throw new Error("Unexpected response shape from /admin/regions");
    }

    const regionMap = data.regions.reduce<Record<string, string>>(
        (acc, region) => {
            acc[region.name] = region.id;
            return acc;
        },
        {}
    );
    logger.info(`Found ${data.regions.length} Medusa region(s)`);
    return regionMap;
}

async function seedLocales():Promise<void> {
    logger.info("Seeding locales...")

    await Promise.all(
        LOCALES_CONFIG.map(async (locale) => {
            await prisma.locale.upsert({
                where:{code:locale.code},
                update:{name:locale.name,is_rtl:locale.isRtl},
                create:{code:locale.code,name:locale.name,is_rtl:locale.isRtl},
            })
            logger.info(`Upserted locale: ${locale.code} (${locale.name})`)
        })
    )
    logger.info(`Seeded ${LOCALES_CONFIG.length} locale(s)`);
}

async function seedRegions(medusaRegionMap: Record<string, string>):Promise<void> {
    logger.info("Seeding regions...")

    let seeded =0
    let skipped = 0

    for (const regionConfig of REGIONS_CONFIG) {
        const medusaRegionId = medusaRegionMap[regionConfig.medusaName];
        if(!medusaRegionId){
            logger.warn(
                `Medusa region "${regionConfig.medusaName}" not found — skipping. ` +
                `Create it in Medusa admin first.`
            );
            skipped++
            continue;
        }
        const region = await prisma.region.upsert({
            where: { code: regionConfig.code },
            update: {
                medusa_region_id: medusaRegionId,
                is_active: true,
            },
            create: {
                code: regionConfig.code,
                medusa_region_id: medusaRegionId,
                is_active: true,
            },
        });

        logger.info(`Upserted region: ${regionConfig.code}`);

        // Seed region locales
        for (const localeConfig of regionConfig.locales) {
            await prisma.regionLocale.upsert({
                where: {
                    region_id_locale_code: {
                        region_id: region.id,
                        locale_code: localeConfig.code,
                    },
                },
                update: {
                    is_default: localeConfig.isDefault,
                },
                create: {
                    region_id: region.id,
                    locale_code: localeConfig.code,
                    is_default: localeConfig.isDefault,
                },
            });

            logger.info(
                `Upserted region locale: ${regionConfig.code} → ${localeConfig.code} ` +
                `(default: ${localeConfig.isDefault})`
            );
        }

        seeded++;
    }
    logger.info(`Seeded ${seeded} region(s), skipped ${skipped}`);
}

async function main(): Promise<void> {
    logger.info("Starting bootstrap seed...");

    try {
        const token = await getMedusaToken();
        const medusaRegionMap = await getMedusaRegionMap(token);

        await seedLocales();
        await seedRegions(medusaRegionMap);

        logger.info("Bootstrap seed completed successfully ✓");
    } catch (error) {
        logger.error(error, "Bootstrap seed failed");
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

export default async function() {
    await main();
}