import { faker } from '@faker-js/faker'
import { Session } from '@weareinreach/auth'

interface MockAuthStates {
	[state: string]: {
		title: string
		session: MockSession | null
	}
}
interface MockSession {
	data: Session | null
	status: 'loading' | 'authenticated' | 'unauthenticated'
}

const states = {
	unknown: {
		title: 'session unknown',
		session: null,
	},
	loading: {
		title: 'session loading',
		session: {
			data: null,
			status: 'loading',
		},
	},
	admin: {
		title: 'admin [no auth]',
		session: {
			data: {
				user: {
					id: 'clcuqtira000108l25jzp4ybq',
					role: 'admin',
					permissions: ['admin', 'user'],
					name: 'Administrator',
					email: 'admin@local',
					image: faker.image.avatar(),
				},
				expires: '',
			},
			status: 'unauthenticated',
		},
	},
	adminAuthed: {
		title: 'admin [auth]',
		session: {
			data: {
				user: {
					id: 'clcuqtira000108l25jzp4ybq',
					role: 'admin',
					permissions: ['admin', 'user'],
					name: 'Administrator',
					email: 'admin@local',
				},
				expires: '',
			},
			status: 'authenticated',
		},
	},
	userPic: {
		title: 'user w/ pic [no auth]',
		session: {
			data: {
				user: {
					id: 'clcuqtvi0000208l29g307pvd',
					role: 'user',
					permissions: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
					image: faker.image.avatar(),
				},
				expires: '',
			},
			status: 'unauthenticated',
		},
	},
	userPicAuthed: {
		title: 'user w/ pic [auth]',
		session: {
			data: {
				user: {
					id: 'clcuqtvi0000208l29g307pvd',
					role: 'user',
					permissions: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
					image: faker.image.avatar(),
				},
				expires: '',
			},
			status: 'authenticated',
		},
	},
	user: {
		title: 'user w/o pic [no auth]',
		session: {
			data: {
				user: {
					id: 'clcuqtvi0000208l29g307pvd',
					role: 'user',
					permissions: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
				},
				expires: '',
			},
			status: 'unauthenticated',
		},
	},
	userAuthed: {
		title: 'user w/o pic [auth]',
		session: {
			data: {
				user: {
					id: 'clcuqtvi0000208l29g307pvd',
					role: 'user',
					permissions: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
				},
				expires: '',
			},
			status: 'authenticated',
		},
	},
} satisfies MockAuthStates

export default states
