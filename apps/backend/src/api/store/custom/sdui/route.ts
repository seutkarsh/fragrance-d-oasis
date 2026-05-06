import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {QUERY_PARAMS_ERROR, SduiQuerySchema} from "@fragrance/shared";
import {logger} from "@fragrance/shared/logger"
import {prisma} from "@fragrance/database";


export async function GET(req:MedusaRequest, res:MedusaResponse){

    const queryResult = SduiQuerySchema.safeParse({
        slug:(req as any).customQuery.slug,
    })

    if(!queryResult.success){
        return res.status(400).json({
            error:QUERY_PARAMS_ERROR.INVALID_QUERY_PARAMS,
            details:queryResult.error.flatten().fieldErrors
        })
    }
    
    const {slug} = queryResult.data
    
    try{
        const page = await prisma.sduiPage.findUnique({
            where: {slug,is_active:true},
            include:{
                blocks:{
                    where:{is_active:true},
                    orderBy:{sort_order:'asc'},
                    select:{id:true,layout:true,content:true,sort_order:true}
                }
            }
        })

        if(!page){
            return res.status(404).json({
                error:`SDUI page not found: ${slug}`
            })
        }

        logger.info(`SDUI served: ${slug} [${page.blocks.length} blocks]`)
        console.log(page.blocks)
        res.status(200).json({
            blocks:page.blocks
        })
    }catch (error) {
        logger.error(error, `Failed to fetch SDUI page: ${slug}`)
        return res.status(500).json({ error: "Internal server error" })
    }
}