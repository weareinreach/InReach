import { type CSSProperties } from 'react'

type VariantStyles = Record<string, Partial<Record<'root', CSSProperties>>>

/** `coolGray`/`coolGrayStrikethru` were dropped - confirmed zero usage repo-wide. */
export const Title = (theme: import('@mantine/core').MantineTheme): VariantStyles => ({
	darkGray: { root: { color: `${theme.other.colors.secondary.darkGray} !important` } },
	darkGrayStrikethru: {
		root: { color: theme.other.colors.secondary.darkGray, textDecoration: 'line-through' },
	},
})
