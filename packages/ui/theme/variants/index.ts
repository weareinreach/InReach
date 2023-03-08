import { Anchor } from './Anchor'
import { Badge } from './Badge'
import { Skeleton } from './Skeleton'
import { Text } from './Text'

export const variants = {
	Anchor,
	Badge,
	Skeleton,
	Text,
} as const

export const variantNames: VariantNames = {
	Anchor: {
		inline: 'inline',
	},
	Badge: {
		community: 'community',
		service: 'service',
		leader: 'leader',
		attributeBadge: 'attributeBadge',
		privatePractice: 'privatePractice',
		claimed: 'claimed',
		unclaimed: 'unclaimed',
		verified: 'verified',
		attribute: 'attribute',
	},
	Skeleton: {
		text: 'text',
		utility: 'utility',
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
	},
	Text: {
		utility1: 'utility1',
		utility2: 'utility2',
		utility3: 'utility3',
		utility4: 'utility4',
		utility1darkGray: 'utility1darkGray',
		utility2darkGray: 'utility2darkGray',
		utility3darkGray: 'utility3darkGray',
		utility4darkGray: 'utility4darkGray',
		darkGray: 'darkGray',
	},
}

type VariantNames = {
	[K in keyof typeof variants]: {
		[V in keyof (typeof variants)[K]]: V
	}
}
