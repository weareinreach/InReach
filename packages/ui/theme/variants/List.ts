import { rem, type Styles, type ListStylesNames, type ListStylesParams } from '@mantine/core'

import { VariantObj } from '~ui/types/mantine'

export const List = {
	inlineUtil2: (theme) =>
		({
			root: {
				...theme.other.utilityFonts.utility2,
				color: theme.other.colors.secondary.darkGray,
				display: 'inline-flex',
				gap: rem(16),
				flexWrap: 'wrap',
			},
			item: {
				display: 'inline-block',
				listStyle: 'none',
			},
			itemIcon: {
				display: 'none',
			},
		} satisfies Styles<ListStylesNames, ListStylesParams>),
	inlineBulletUtil2: (theme) =>
		({
			root: {
				...theme.other.utilityFonts.utility2,
				display: 'inline-flex',
				columnGap: rem(8),
				rowGap: rem(16),
				flexWrap: 'wrap',
				alignItems: 'center',
			},
			item: {
				'&:first-of-type .mantine-List-itemIcon': {
					display: 'none',
				},
			},
			itemIcon: {
				marginTop: 'auto',
				marginBottom: 'auto',
				marginRight: rem(8),
			},
			itemWrapper: {
				alignItems: 'center',
			},
		} satisfies Styles<ListStylesNames, ListStylesParams>),
	inlineBullet: (theme) =>
		({
			root: {
				display: 'inline-flex',
				columnGap: rem(8),
				rowGap: rem(16),
				flexWrap: 'wrap',
				alignItems: 'center',
			},
			item: {
				'&:first-of-type .mantine-List-itemIcon': {
					display: 'none',
				},
			},
			itemIcon: {
				marginTop: 'auto',
				marginBottom: 'auto',
				marginRight: rem(8),
			},
			itemWrapper: {
				alignItems: 'center',
			},
		} satisfies Styles<ListStylesNames, ListStylesParams>),
	inline: (theme) =>
		({
			root: {
				display: 'inline-flex',
				gap: rem(16),
				flexWrap: 'wrap',
			},
			item: {
				display: 'inline-block',
				listStyle: 'none',
			},
			itemIcon: {
				display: 'none',
			},
		} satisfies Styles<ListStylesNames, ListStylesParams>),
	textDarkGray: (theme) =>
		({
			item: {
				color: theme.other.colors.secondary.darkGray,
			},
		} satisfies Styles<ListStylesNames, ListStylesParams>),
} satisfies VariantObj
