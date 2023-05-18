import { type InputStylesNames, type InputStylesParams, rem, type Styles } from '@mantine/core'
import objectMap from 'just-map-values'

import { type VariantObj } from '~ui/types/mantine'

export const Input = {
	small: (theme) => ({
		input: {
			borderWidth: rem(1),
			borderStyle: 'solid',
			borderColor: theme.other.colors.tertiary.coolGray,
			borderRadius: rem(8),
			...objectMap(theme.other.utilityFonts.utility4, (value) => `${value} !important`),
			padding: `${rem(6)} ${rem(8)}`,
			margin: `${rem(10)} 0`,
			height: `${rem(40)} !important`,
			'&::placeholder': {
				color: theme.other.colors.secondary.darkGray,
			},
			'&:focus, &:focus-within, &:focus-visible': {
				borderColor: `${theme.other.colors.secondary.black}`,
				outlineColor: `${theme.other.colors.secondary.black}`,
				borderWidth: rem(2),
			},
			'&[data-with-icon]': {
				borderRadius: theme.radius.xl,
				paddingLeft: rem(36),
			},
			'&[data-invalid]': {
				'&::placeholder': {
					color: theme.other.colors.secondary.darkGray,
				},
				'&:focus, &:focus-within, &:focus-visible': {
					color: theme.other.colors.secondary.black,
					borderColor: theme.other.colors.tertiary.red,
					outlineColor: theme.other.colors.tertiary.red,
					borderWidth: rem(2),
				},
			},
			'&[data-disabled],:disabled': {
				backgroundColor: theme.other.colors.primary.lightGray,
				color: theme.other.colors.secondary.darkGray,
				opacity: 1,
				'&::placeholder': {
					color: theme.other.colors.secondary.darkGray,
				},
			},
		},
	}),
} satisfies VariantObj
