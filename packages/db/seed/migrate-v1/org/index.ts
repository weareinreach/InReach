import { ListrTask } from '~/seed/migrate-v1'

import {
	attributeRecords,
	attributeSupplements,
	generateRecords,
	migrateOrgs,
	orgAPIConnections,
	orgEmails,
	orgHours,
	orgLocations,
	orgPhones,
	orgPhotos,
	orgServices,
	orgSocials,
	orgWebsites,
	serviceAccess,
	serviceAreas,
	serviceConnections,
	translationKeys,
} from './generator'

export const runMigrateOrgs = (task: ListrTask) => task.newListr([])
