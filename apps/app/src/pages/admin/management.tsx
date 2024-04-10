import { ManagementTable } from '@weareinreach/ui/components/data-portal/ManagementTable'
import { userManagement } from '@weareinreach/ui/mockData/userManagement'

export const Management = () => {
	return (
		<ManagementTable
			data={userManagement.forUserManagementTable()}
			columns={userManagement.forUserManagementColumns()}
		></ManagementTable>
	)
}

export default Management
