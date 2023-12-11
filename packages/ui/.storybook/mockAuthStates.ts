import { type Session } from '@weareinreach/auth'

const expires = (Date.now() / 1000 + 3600).toString()

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
					id: 'user_01HHCVWRJPJGPF91SX6HF2QTK3',
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
					id: 'user_01HHCVWRJP2B0D2NDS9BNAHWBY',
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
					id: 'user_01HHCVWRJPXQS3BN8A88G5YJ1M',
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
					id: 'user_01HHCVWRJPE7MR7HK1965BCHFA',
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

export type MockAuth = Record<
	string,
	{
		title: string
		session: SessionContext
	}
>

export default states
