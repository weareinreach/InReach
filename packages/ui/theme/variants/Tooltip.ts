import { type CSSProperties } from 'react'

type VariantStyles = Record<string, Partial<Record<'tooltip', CSSProperties>>>

export const Tooltip = (theme: import('@mantine/core').MantineTheme): VariantStyles => {
	const { color: _color, ...fontProps } = theme.other.utilityFonts.utility1
	return {
		utility1: {
			tooltip: {
				...fontProps,
				lineBreak: 'loose',
			},
		},
	}
}
