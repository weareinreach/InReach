import { faker } from '@faker-js/faker'

export const userManagement = {
	forUserManagementColumns: () => {
		return [
			{
				accessorKey: 'name',
				header: 'Name',
			},
			{
				accessorKey: 'email',
				header: 'Email',
			},
			{
				accessorKey: 'appUserType',
				header: 'App User Type',
			},
			{ accessorKey: 'role', header: 'Back-end user type' },
			{
				accessorKey: 'updatedAt',
				header: 'Last updated',
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
			},
		]
	},
	forUserManagementTable: () => {
		const totalRecords = 1000
		faker.seed(1024)
		const data = []

		for (let index = 0; index < totalRecords; index++) {
			const name = faker.person.fullName()
			const email = `${name.split(' ')[1]}@gmail.com`.toLowerCase()
			const updatedAt = Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(faker.date.past())

			data.push({
				name: name,
				email: email,
				appUserType: faker.person.jobTitle(),
				role: faker.person.jobType(),
				updatedAt: updatedAt,
				createdAt: Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
					faker.date.past({ refDate: updatedAt })
				),
			})
		}
		return data
	},
}
