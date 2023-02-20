import { Session } from '@weareinreach/auth'
import { ulid } from 'ulid'

const expires = (Date.now() / 1000 + 3600).toString()

const createId = () => `user_${ulid()}`

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
					id: createId(),
					permissions: ['canAdmin', 'canUser'],
					roles: ['admin', 'user'],
					name: 'Administrator',
					email: 'placeholder.admin@gmail.com',
					image: 'https://i.pravatar.cc/50?u=1234567',
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
					email: 'placeholder.admin@gmail.com',
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
					name: "Unauth'd User",
					email: 'placeholder.user@gmail.com',
					image: 'https://i.pravatar.cc/50?u=abcdef',
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
					name: "Auth'd User",
					email: 'placeholder.user@gmail.com',
					image: 'https://i.pravatar.cc/50?u=abcdef',
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
					name: 'User name',
					email: 'user.name@gmail.com',
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
					name: 'User name',
					email: 'user.name@gmail.com',
				},
				expires,
			},
			status: 'authenticated',
		},
	},
} as const

type SessionContext =
	| {
			data: Session | null
			status: 'unauthenticated' | 'loading' | 'authenticated'
	  }
	| undefined
	| null

type MockAuth = Record<
	string,
	{
		title: string
		session: SessionContext
	}
>

export default states
