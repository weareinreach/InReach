import { type ListStylesNames, type ListStylesParams, rem, type Styles } from '@mantine/core'

import { type VariantObj } from '~ui/types/mantine'

export const List = {
	inlineUtil2: (theme) =>
		({
			root: {
				...theme.other.utilityFonts.utility2,
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
		}) satisfies Styles<ListStylesNames, ListStylesParams>,
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
		}) satisfies Styles<ListStylesNames, ListStylesParams>,
	inlineUtil2DarkGray: (theme) =>
		({
			root: {
				...theme.other.utilityFonts.utility2,
				display: 'inline-flex',
				gap: rem(16),
				flexWrap: 'wrap',
			},
			item: {
				display: 'inline-block',
				listStyle: 'none',
				color: theme.other.colors.secondary.darkGray,
			},
			itemIcon: {
				display: 'none',
			},
		}) satisfies Styles<ListStylesNames, ListStylesParams>,
	inlineBulletUtil2DarkGray: (theme) =>
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
				color: theme.other.colors.secondary.darkGray,
			},
			itemIcon: {
				marginTop: 'auto',
				marginBottom: 'auto',
				marginRight: rem(8),
			},
			itemWrapper: {
				alignItems: 'center',
			},
		}) satisfies Styles<ListStylesNames, ListStylesParams>,
	inlineBullet: () =>
		({
			root: {
				display: 'inline-flex',
				columnGap: rem(8),
				rowGap: rem(12),
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
		}) satisfies Styles<ListStylesNames, ListStylesParams>,
	inline: () =>
		({
			root: {
				display: 'inline-flex',
				gap: rem(12),
				flexWrap: 'wrap',
			},
			item: {
				display: 'inline-block',
				listStyle: 'none',
			},
			itemIcon: {
				display: 'none',
			},
		}) satisfies Styles<ListStylesNames, ListStylesParams>,
	textDarkGray: (theme) =>
		({
			item: {
				color: theme.other.colors.secondary.darkGray,
			},
		}) satisfies Styles<ListStylesNames, ListStylesParams>,
} satisfies VariantObj
