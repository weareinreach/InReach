// import { rem } from '@mantine/core'

import { type VariantObj } from '~ui/types/mantine'

export const Text = {
	utility1: (theme) => ({
		root: theme.other.utilityFonts.utility1,
	}),
	utility2: (theme) => ({
		root: theme.other.utilityFonts.utility2,
	}),
	utility3: (theme) => ({
		root: theme.other.utilityFonts.utility3,
	}),
	utility4: (theme) => ({
		root: theme.other.utilityFonts.utility4,
	}),
	utility1darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility1,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	utility1darkGrayStrikethru: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility1,
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	}),
	utility2darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility2,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	utility3darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility3,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	utility3darkGrayStrikethru: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility3,
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	}),
	utility4darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility4,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	utility4darkGrayStrikethru: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility4,
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	}),
	darkGray: (theme) => ({
		root: {
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	darkGrayStrikethru: (theme) => ({
		root: {
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	}),
	utility1white: (theme) => ({
		root: { ...theme.other.utilityFonts.utility1, color: theme.other.colors.secondary.white },
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
	utility4coolGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility4,
			color: theme.other.colors.tertiary.coolGray,
		},
	}),
	utility4coolGrayStrikethru: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility4,
			color: theme.other.colors.tertiary.coolGray,
			textDecoration: 'line-through',
		},
	}),
} satisfies VariantObj
