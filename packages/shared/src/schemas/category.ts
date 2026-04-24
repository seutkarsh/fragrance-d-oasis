import { z } from "zod";

export const CategoryCustomQuerySchema = z.object({
    locale: z.string().min(1, "locale is required"),
    region_id: z.string().min(1, "region_id is required"),
});

export type CategoryCustomQuery = z.infer<typeof CategoryCustomQuerySchema>;