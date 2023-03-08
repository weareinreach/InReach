import { VariantObj } from '~ui/types/mantine'

export const Anchor = {
	inline: (theme) => ({
		root: {
			padding: '0 !important',
			fontWeight: `${theme.other.fontWeight.regular} !important` as unknown as 'normal',
			lineHeight: `${theme.lineHeight} !important`,
			'&:hover': {
				backgroundColor: 'transparent !important',
			},
		},
	}),
	inlineInverted: (theme) => ({
		root: {
			padding: '0 !important',
			fontWeight: `${theme.other.fontWeight.regular} !important` as unknown as 'normal',
			lineHeight: `${theme.lineHeight} !important`,
			textDecoration: 'none !important',
			'&:hover': {
				backgroundColor: 'transparent !important',
				textDecoration: 'underline !important',
			},
		},
	}),
	inlineInvertedUtil1: (theme) => ({
		root: {
			padding: '0 !important',
			textDecoration: 'none !important',
			...theme.other.utilityFonts.utility1,
			'&:hover': {
				backgroundColor: 'transparent !important',
				textDecoration: 'underline !important',
			},
		},
	}),
} satisfies VariantObj
