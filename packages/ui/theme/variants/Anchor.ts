import { VariantObj } from '~ui/types/mantine'

export const Anchor = {
	inline: (theme) => ({
		root: {
			display: 'inline',
			padding: '0 !important',
			fontWeight: `${theme.other.fontWeight.regular} !important` as unknown as 'normal',
			lineHeight: `${theme.lineHeight} !important`,
			'&:hover': {
				backgroundColor: 'transparent !important',
			},
		},
	}),
	inlineUtil1: (theme) => ({
		root: {
			// display: 'inline',
			padding: '0 !important',
			...theme.other.utilityFonts.utility1,
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
	inheritStyle: (theme) => ({
		root: {
			display: 'inline',
			padding: '0 !important',
			fontWeight: 'inherit !important' as unknown as 'normal',
			lineHeight: 'inherit !important',
			color: 'inherit !important',
			fontSize: 'inherit !important',
			'&:hover': {
				backgroundColor: 'transparent !important',
			},
		},
	}),
	block: (theme) => ({
		root: {
			display: 'block',
		},
	}),
} satisfies VariantObj
