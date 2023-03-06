import { rem } from '@mantine/core'

import { VariantDef } from '~ui/types/mantine'

export const attributeBadge: VariantDef = (theme) => ({
	inner: {
		'& *, span': {
			...theme.other.utilityFonts.utility1,
			width: 'auto',
			marginLeft: theme.spacing.xs,
			textTransform: 'none',
		},
	},
	root: {
		border: 0,
		padding: 0,
		alignItems: 'flex-start',
		lineHeight: 'inherit',
		borderRadius: 0,
	},
	leftSection: {
		height: rem(24),
		'& *': {
			margin: 0,
		},
		'& svg': {
			verticalAlign: 'sub',
		},
	},
})
