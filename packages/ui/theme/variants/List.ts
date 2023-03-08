import { rem, type Styles, type ListStylesNames, type ListStylesParams } from '@mantine/core'

import { VariantObj } from '~ui/types/mantine'

export const List = {
	inlineUtil2: (theme) =>
		({
			root: {
				...theme.other.utilityFonts.utility2,
				color: theme.other.colors.secondary.darkGray,
				display: 'flex',
				columnGap: rem(16),
				flexWrap: 'wrap',
			},
			item: {
				display: 'inline-block',
				listStyle: 'none',
				// marginBottom: rem(12),
				// marginRight: rem(16),
			},
		} satisfies Styles<ListStylesNames, ListStylesParams>),
	inlineBulletUtil2: (theme) =>
		({
			root: {
				...theme.other.utilityFonts.utility2,
				color: theme.other.colors.secondary.darkGray,
				display: 'flex',
				gap: rem(8),
				flexWrap: 'wrap',
				// padding: `${rem(0)} ${rem(8)}`,
			},
			item: {
				display: 'inline-block',
				listStyle: 'none',
				'&:not(:first-of-type)::before': {
					content: `''`,
					display: 'inline-block',
					verticalAlign: 'middle',
					margin: `auto 0`,
					marginRight: rem(8),
					width: rem(4),
					height: rem(4),
					borderRadius: '50%',
					backgroundColor: 'currentColor',
				},
			},
		} satisfies Styles<ListStylesNames, ListStylesParams>),
	inlineBullet: (theme) => ({
		item: {
			display: 'inline-block',
			listStyle: 'none',
			// marginBottom: rem(12),
			'&:not(:first-of-type)::before': {
				content: `''`,
				display: 'inline-block',
				verticalAlign: 'middle',
				margin: `auto 0`,
				width: rem(4),
				height: rem(4),
				borderRadius: '50%',
				backgroundColor: 'currentColor',
			},
		},
	}),
	inline: (theme) => ({
		item: {
			display: 'inline-block',
			listStyle: 'none',
		},
	}),
} satisfies VariantObj
