import {z} from "zod";

export const ProductCustomQuerySchema = z.object({
    region_id:z.string().min(1,'region_id is required'),
    locale:z.string().min(1,'locale is required'),
})

export const ProductHandleParamsSchema = z.object({
    handle: z.string().min(1, "handle is required"),
});

export type ProductCustomQuery = z.infer<typeof ProductCustomQuerySchema>;
export type ProductHandleParams = z.infer<typeof ProductHandleParamsSchema>;