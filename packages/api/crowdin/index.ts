import { crowdinApi, crowdinOta, crowdinVars } from './client'
import { branches, files } from './opts'

export const getStringIdByKey = async (key: string, databaseString?: boolean) => {
	const { data: crowdinString } = await crowdinApi.sourceStringsApi.listProjectStrings(
		crowdinVars.projectId,
		{ branchId: databaseString ? branches.database : branches.main, filter: key, scope: 'identifier' }
	)

	return crowdinString.find(({ data }) => data.identifier === key)?.data.id
}

export { crowdinApi, crowdinOta }
