import { rem } from '@mantine/core'

import { VariantObj } from '~ui/types/mantine'

export const Tooltip = {
	utility1: (theme) => {
		const { color, ...fontProps } = theme.other.utilityFonts.utility1
		return {
			tooltip: {
				...fontProps,
				lineBreak: 'loose',
			},
		}
	},
} satisfies VariantObj
