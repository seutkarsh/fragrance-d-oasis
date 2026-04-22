import { z } from "zod";
import dotenv from "dotenv";
import { logger } from "@fragrance/shared";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    // Server
    PORT: z.string().default("9000").transform(Number),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Medusa
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    COOKIE_SECRET: z.string().min(1, "COOKIE_SECRET is required"),
    STORE_CORS: z.string().min(1, "STORE_CORS is required"),
    ADMIN_CORS: z.string().min(1, "ADMIN_CORS is required"),
    AUTH_CORS: z.string().min(1, "AUTH_CORS is required"),

    // Seed
    MEDUSA_BACKEND_URL: z.string().default("http://localhost:9000"),
    SEED_ADMIN_EMAIL: z.string().email().default("admin@fodubai.com"),
    SEED_ADMIN_PASSWORD: z.string().min(1).default("admin123"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    logger.error(
        { errors: parsed.error.flatten().fieldErrors },
        "Invalid environment variables — server cannot start"
    );
    process.exit(1);
}

logger.info("Environment variables validated");

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;