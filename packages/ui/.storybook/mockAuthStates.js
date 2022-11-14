const defaultMockAuthStates = require('@tomfreudenberg/next-auth-mock').mockAuthStates

module.exports = {
	...defaultMockAuthStates,
	admin: {
		title: 'admin not authenticated',
		session: {
			data: {
				user: {
					id: 1,
					login: 'admin',
					role: 'admin',
					roles: ['admin', 'user'],
					username: 'Administrator',
					email: 'admin@local',
				},
			},
			status: 'unauthenticated',
		},
	},
	adminAuthed: {
		title: 'admin authenticated',
		session: {
			data: {
				user: {
					id: 1,
					login: 'admin',
					role: 'admin',
					roles: ['admin', 'user'],
					username: 'Administrator',
					email: 'admin@local',
				},
			},
			status: 'authenticated',
		},
	},
	user: {
		title: 'user not authenticated',
		session: {
			data: {
				user: {
					id: 999,
					login: 'user',
					role: 'user',
					roles: ['user'],
					username: 'User',
					email: 'user@local',
				},
			},
			status: 'unauthenticated',
		},
	},
	userAuthed: {
		title: 'user authenticated',
		session: {
			data: {
				user: {
					id: 999,
					login: 'user',
					role: 'user',
					roles: ['user'],
					username: 'User',
					email: 'user@local',
				},
			},
			status: 'authenticated',
		},
	},
}
