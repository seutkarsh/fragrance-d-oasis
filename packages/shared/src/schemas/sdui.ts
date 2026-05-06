import {z} from "zod";

export const SduiQuerySchema = z.object({
    slug:z.string().min(1,'slug in required')
})