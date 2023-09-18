import { branches, projectId } from '../constants'

import type CrowdinApi from '@crowdin/crowdin-api-client'

export const createCommonFns = (client: CrowdinApi) => ({
	getStringIdByKey: async (key: string, databaseString?: boolean) => {
		const { data: crowdinString } = await client.sourceStringsApi.listProjectStrings(projectId, {
			branchId: databaseString ? branches.database : branches.main,
			filter: key,
			scope: 'identifier',
		})

		return crowdinString.find(({ data }) => data.identifier === key)?.data.id
	},
})
