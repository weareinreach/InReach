import { Anchor } from './Anchor'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import { List } from './List'
import { Skeleton } from './Skeleton'
import { Text } from './Text'
import { Tooltip } from './Tooltip'

export const variants = {
	Anchor,
	Badge,
	Button,
	Card,
	List,
	Skeleton,
	Text,
	Tooltip,
} as const

export const variantNames: VariantNames = {
	Anchor: {
		inline: 'inline',
		inlineInverted: 'inlineInverted',
		inlineInvertedUtil1: 'inlineInvertedUtil1',
		inheritStyle: 'inheritStyle',
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
	Button: {
		accent: 'accent',
		accentLg: 'accentLg',
		primaryLg: 'primaryLg',
		primarySm: 'primarySm',
		secondaryLg: 'secondaryLg',
		secondarySm: 'secondarySm',
	},
	Card: {
		hoverCoolGray: 'hoverCoolGray',
	},
	List: {
		inline: 'inline',
		inlineBullet: 'inlineBullet',
		inlineBulletUtil2: 'inlineBulletUtil2',
		inlineUtil2: 'inlineUtil2',
		textDarkGray: 'textDarkGray',
	},
	Skeleton: {
		text: 'text',
		utility: 'utility',
		utilitySm: 'utilitySm',
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
	Tooltip: {
		utility1: 'utility1',
	},
} as const

type VariantNames = {
	[K in keyof typeof variants]: {
		[V in keyof (typeof variants)[K]]: V
	}
}
