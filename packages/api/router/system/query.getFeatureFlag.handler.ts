import { createClient } from '@vercel/edge-config'

import { getEnv } from '@weareinreach/env'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetFeatureFlagSchema } from './query.getFeatureFlag.schema'

const getFeatureFlag = async ({ input }: TRPCHandlerParams<TGetFeatureFlagSchema>) => {
	const flagClient = createClient(getEnv('FEATURE_FLAG_CONFIG') satisfies string)

	const result = (await flagClient.get<boolean>(input)) ?? false

	return { flag: result }
}
export default getFeatureFlag
