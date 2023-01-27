import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'
import { Session } from '@weareinreach/auth'

const expires = (Date.now() / 1000 + 3600).toString()

const states: MockAuth = {
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
					id: createId(),
					permissions: ['canAdmin', 'canUser'],
					roles: ['admin', 'user'],
					name: 'Administrator',
					email: faker.internet.email(),
					image: faker.image.avatar(),
				},
				expires,
			},
			status: 'unauthenticated',
		},
	},
	adminAuthed: {
		title: 'admin [auth]',
		session: {
			data: {
				user: {
					id: createId(),
					permissions: ['canAdmin', 'canUser'],
					roles: ['admin', 'user'],
					name: 'Administrator',
					email: faker.internet.email(),
				},
				expires,
			},
			status: 'authenticated',
		},
	},
	userPic: {
		title: 'user w/ pic [no auth]',
		session: {
			data: {
				user: {
					id: createId(),
					roles: ['user'],
					permissions: ['canUser'],
					name: faker.name.fullName(),
					email: faker.internet.email(),
					image: faker.image.avatar(),
				},
				expires,
			},
			status: 'unauthenticated',
		},
	},
	userPicAuthed: {
		title: 'user w/ pic [auth]',
		session: {
			data: {
				user: {
					id: createId(),
					roles: ['user'],
					permissions: ['canUser'],
					name: faker.name.fullName(),
					email: faker.internet.email(),
					image: faker.image.avatar(),
				},
				expires,
			},
			status: 'authenticated',
		},
	},

	user: {
		title: 'user w/o pic [no auth]',
		session: {
			data: {
				user: {
					id: createId(),
					roles: ['user'],
					permissions: ['canUser'],
					name: faker.name.fullName(),
					email: faker.internet.email(),
				},
				expires,
			},
			status: 'unauthenticated',
		},
	},
	userAuthed: {
		title: 'user w/o pic [auth]',
		session: {
			data: {
				user: {
					id: createId(),
					roles: ['user'],
					permissions: ['canUser'],
					name: faker.name.fullName(),
					email: faker.internet.email(),
				},
				expires,
			},
			status: 'authenticated',
		},
	},
}

type SessionContext =
	| {
			data: Session | null
			status: 'unauthenticated' | 'loading' | 'authenticated'
	  }
	| undefined
	| null

type MockAuth = {
	[key: string]: {
		title: string
		session: SessionContext
	}
}

export default states
