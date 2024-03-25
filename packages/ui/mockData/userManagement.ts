import { faker } from '@faker-js/faker'

type Person = {
	name: string
	email: string
	appUserType: string
	role: string
	updatedAt: string
	createdAt: string
}

export const userManagement = {
	forUserManagementTable: () => {
		const totalRecords = 1000
		faker.seed(1024)
		const data: Person[] = []

		for (let index = 0; index < totalRecords; index++) {
			const name = faker.person.fullName()
			const email = `${name.split(' ')[1]}@gmail.com`.toLowerCase()

			data.push({
				name: name,
				email: email,
				appUserType: faker.person.jobTitle(),
				role: faker.person.jobType(),
				updatedAt: Intl.DateTimeFormat('en-US').format(faker.date.past()),
				createdAt: Intl.DateTimeFormat('en-US').format(faker.date.past()), //make this make sense logically
			})
		}
		return data
	},
}
