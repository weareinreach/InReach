import { VariantObj } from '~ui/types/mantine'

export const Anchor = {
	inline: (theme) => ({
		root: {
			padding: 0,
			fontWeight: theme.other.fontWeight.regular,
			lineHeight: theme.lineHeight,
			'&:hover': {
				backgroundColor: 'none',
			},
		},
	}),
} satisfies VariantObj
