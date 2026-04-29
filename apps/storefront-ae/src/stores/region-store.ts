import { create } from "zustand"
import { persist } from "zustand/middleware"

type RegionState = {
    regionId: string
    regionCode: string
    setRegion: (regionId: string, regionCode: string) => void
}

export const useRegionStore = create<RegionState>()(
    persist(
        (set) => ({
            regionId: "reg_01KPTTDYT58TZ8PKCK76C6JRCT",
            regionCode: "ae",
            setRegion: (regionId, regionCode) => set({ regionId, regionCode }),
        }),
        {
            name: "fdo-region",
        }
    )
)