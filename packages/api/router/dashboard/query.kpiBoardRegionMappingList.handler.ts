import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TKpiBoardRegionMappingListSchema } from './query.kpiBoardRegionMappingList.schema'

const kpiBoardRegionMappingList = async (_params: TRPCHandlerParams<TKpiBoardRegionMappingListSchema>) =>
	prisma.kpiRegionMapping.findMany({ orderBy: { sortOrder: 'asc' } })

export default kpiBoardRegionMappingList
