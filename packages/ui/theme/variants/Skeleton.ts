import { rem } from '@mantine/core'

import { VariantObj } from '~ui/types/mantine'

export const Skeleton = {
	text: (theme) => ({
		root: {
			height: rem(16 * 1.5),
		},
	}),
	utility: (theme) => ({
		root: {
			height: rem(16 * 1.25),
		},
	}),
	h1: (theme) => ({
		root: {
			height: rem(40 * 1.25),
		},
	}),
	h2: (theme) => ({
		root: {
			height: rem(24 * 1.25),
		},
	}),
	h3: (theme) => ({
		root: {
			height: rem(16 * 1.25),
		},
	}),
} satisfies VariantObj
