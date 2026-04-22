export const REGIONS_CONFIG = [
    {
        medusaName:"UAE",
        code:'ae',
        locales:[
            {
                code:'en',isDefault:true
            },
            {
                code:'ar',isDefault:false
            },
        ]
    }
]

export type RegionConfig = (typeof REGIONS_CONFIG)[number];