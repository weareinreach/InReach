const { faker } = require('@faker-js/faker')

module.exports = {
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
					id: 1,
					role: 'admin',
					roles: ['admin', 'user'],
					name: 'Administrator',
					email: 'admin@local',
					image: faker.image.avatar(),
				},
			},
			status: 'unauthenticated',
		},
	},
	adminAuthed: {
		title: 'admin [auth]',
		session: {
			data: {
				user: {
					id: 1,
					role: 'admin',
					roles: ['admin', 'user'],
					name: 'Administrator',
					email: 'admin@local',
				},
			},
			status: 'authenticated',
		},
	},
	userPic: {
		title: 'user w/ pic [no auth]',
		session: {
			data: {
				user: {
					id: 999,
					login: 'user',
					role: 'user',
					roles: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
					image: faker.image.avatar(),
				},
			},
			status: 'unauthenticated',
		},
	},
	userPicAuthed: {
		title: 'user w/ pic [auth]',
		session: {
			data: {
				user: {
					id: 999,
					login: 'user',
					role: 'user',
					roles: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
					image: faker.image.avatar(),
				},
			},
			status: 'authenticated',
		},
	},
	user: {
		title: 'user w/o pic [no auth]',
		session: {
			data: {
				user: {
					id: 999,
					login: 'user',
					role: 'user',
					roles: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
				},
			},
			status: 'unauthenticated',
		},
	},
	userAuthed: {
		title: 'user w/o pic [auth]',
		session: {
			data: {
				user: {
					id: 999,
					login: 'user',
					role: 'user',
					roles: ['user'],
					name: faker.name.fullName(),
					email: 'user@local',
				},
			},
			status: 'authenticated',
		},
	},
}
