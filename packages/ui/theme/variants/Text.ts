import { type CSSProperties } from 'react'

type VariantStyles = Record<string, Partial<Record<'root', CSSProperties>>>

/**
 * `coolGray`/`coolGrayStrikethru`/`utility4coolGray`/`utility4coolGrayStrikethru` were dropped - confirmed
 * zero usage repo-wide.
 */
export const Text = (theme: import('@mantine/core').MantineTheme): VariantStyles => ({
	utility1: { root: theme.other.utilityFonts.utility1 },
	utility2: { root: theme.other.utilityFonts.utility2 },
	utility3: { root: theme.other.utilityFonts.utility3 },
	utility4: { root: theme.other.utilityFonts.utility4 },
	utility1darkGray: {
		root: { ...theme.other.utilityFonts.utility1, color: theme.other.colors.secondary.darkGray },
	},
	utility1darkGrayStrikethru: {
		root: {
			...theme.other.utilityFonts.utility1,
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	},
	utility2darkGray: {
		root: { ...theme.other.utilityFonts.utility2, color: theme.other.colors.secondary.darkGray },
	},
	utility3darkGray: {
		root: { ...theme.other.utilityFonts.utility3, color: theme.other.colors.secondary.darkGray },
	},
	utility3darkGrayStrikethru: {
		root: {
			...theme.other.utilityFonts.utility3,
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	},
	utility4darkGray: {
		root: { ...theme.other.utilityFonts.utility4, color: theme.other.colors.secondary.darkGray },
	},
	utility4darkGrayStrikethru: {
		root: {
			...theme.other.utilityFonts.utility4,
			color: theme.other.colors.secondary.darkGray,
			textDecoration: 'line-through',
		},
	},
	darkGray: { root: { color: theme.other.colors.secondary.darkGray } },
	darkGrayStrikethru: {
		root: { color: theme.other.colors.secondary.darkGray, textDecoration: 'line-through' },
	},
	utility1white: {
		root: { ...theme.other.utilityFonts.utility1, color: theme.other.colors.secondary.white },
	},
})
