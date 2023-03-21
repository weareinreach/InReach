import { rem } from '@mantine/core'

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
	inlineInvertedUtil2: (theme) => ({
		root: {
			padding: '0 !important',
			textDecoration: 'none !important',
			...theme.other.utilityFonts.utility2,
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
	card: (theme) => ({
		root: {
			padding: '0 !important',
			fontWeight: 'inherit !important' as unknown as 'normal',
			lineHeight: 'inherit !important',
			color: 'inherit !important',
			fontSize: 'inherit !important',
			textDecoration: 'inherit !important',
		},
	}),
	pagination: (theme) => ({
		root: {
			padding: '0 !important',
			textDecoration: 'none !important',
			...theme.other.utilityFonts.utility1,
			'&[data-disabled]': {
				color: theme.other.colors.tertiary.coolGray,
			},
			'&:hover': {
				backgroundColor: 'transparent !important',
				textDecoration: 'none !important',
				borderBottom: `${rem(2)} solid ${theme.other.colors.secondary.black}`,
				borderRadius: 0,
				'&[data-disabled]': {
					borderBottom: 0,
					cursor: 'not-allowed',
				},
			},
		},
	}),
} satisfies VariantObj
