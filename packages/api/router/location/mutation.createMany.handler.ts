import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateManySchema } from './mutation.createMany.schema'

export const createMany = async ({ ctx, input }: TRPCHandlerParams<TCreateManySchema>) => {}
