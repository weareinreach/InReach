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
	noAuth: {
		title: 'not logged in',
		session: {
			data: null,
			status: 'unauthenticated',
		},
	},
	adminAuthed: {
		title: 'admin session',
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
		title: 'user w/ pic',
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
	userNoPic: {
		title: 'user w/o pic',
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
	userNoPicNoName: {
		title: 'user w/o pic or name',
		session: {
			data: {
				user: {
					id: createId(),
					roles: ['user'],
					permissions: ['canUser'],
					email: 'user.name@gmail.com',
				},
				expires,
			},
			status: 'authenticated',
		},
	},
} as const

type SessionContext = {
	data: Session | null
	status: 'unauthenticated' | 'loading' | 'authenticated'
} | null

type MockAuth = Record<
	string,
	{
		title: string
		session: SessionContext
	}
>

export default states
