// import { rem } from '@mantine/core'

import { type VariantObj } from '~ui/types/mantine'

export const Title = {
	darkGray: (theme) => ({
		root: {
			color: `${theme.other.colors.secondary.darkGray} !important`,
		},
	}),
	darkGrayStrikethru: (theme) => ({
		root: {
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	}),
	coolGray: (theme) => ({
		root: {
			color: theme.other.colors.tertiary.coolGray,
		},
	}),
	coolGrayStrikethru: (theme) => ({
		root: {
			textDecoration: 'line-through',
			color: theme.other.colors.tertiary.coolGray,
		},
	}),
} satisfies VariantObj
