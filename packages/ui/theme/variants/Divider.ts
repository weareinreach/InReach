import { rem } from '@mantine/core'

import { VariantObj } from '~ui/types/mantine'

export const Divider = {
	dot: (theme) => ({
		root: {
			height: rem(4),
			width: rem(4),
			color: theme.other.colors.secondary.black,
			borderRadius: '50%',
		},
	}),
} satisfies VariantObj
