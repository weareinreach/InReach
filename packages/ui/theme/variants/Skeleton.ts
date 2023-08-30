import { rem } from '@mantine/core'

import { type VariantObj } from '~ui/types/mantine'

export const Skeleton = {
	text: () => ({
		root: {
			height: rem(16 * 1.5),
		},
	}),
	utility: () => ({
		root: {
			height: rem(16 * 1.25),
		},
	}),
	utilitySm: () => ({
		root: {
			height: rem(14 * 1.25),
		},
	}),
	h1: () => ({
		root: {
			height: rem(40 * 1.25),
		},
	}),
	h2: () => ({
		root: {
			height: rem(24 * 1.25),
		},
	}),
	h3: () => ({
		root: {
			height: rem(16 * 1.25),
		},
	}),
	badgeGroup: () => ({
		root: {
			height: rem(32),
		},
	}),
	textArea: () => ({
		root: {
			height: rem(120),
		},
	}),
} satisfies VariantObj
