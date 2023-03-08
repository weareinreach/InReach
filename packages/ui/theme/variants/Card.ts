import { rem } from '@mantine/core'

import { VariantObj } from '~ui/types/mantine'

export const Card = {
	hoverCoolGray: (theme) => ({
		root: {
			'&:hover': {
				backgroundColor: theme.other.colors.tertiary.coolGray,
				cursor: 'pointer',
			},
		},
	}),
} satisfies VariantObj
