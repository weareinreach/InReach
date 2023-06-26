// import { rem } from '@mantine/core'

import { type VariantObj } from '~ui/types/mantine'

export const Button = {
	primarySm: (theme) => ({
		root: {
			paddingLeft: `calc(${theme.spacing.md} * 2)`,
			paddingRight: `calc(${theme.spacing.md} * 2)`,
			height: `calc(${theme.spacing.lg} * 2)`,
		},
		'&:not([data-disabled])': theme.fn.hover({
			backgroundColor: theme.fn.darken(theme.other.colors.secondary.white, 0.4),
		}),
		inner: {
			color: theme.other.colors.secondary.white,
		},
		label: {
			left: `calc(${theme.spacing.md} * 2)`,
		},
		leftIcon: {
			display: 'none',
		},
	}),
	secondarySm: (theme) => ({
		root: {
			paddingLeft: `calc(${theme.spacing.md} * 2)`,
			paddingRight: `calc(${theme.spacing.md} * 2)`,
			height: `calc(${theme.spacing.lg} * 2)`,
			border: theme.other.border.default,
			borderColor: theme.other.colors.tertiary.coolGray,
			backgroundColor: `${theme.other.colors.secondary.white} !important`,
			// backgroundColor: `${theme.other.colors.secondary.white}`,
			'&:not([data-disabled])': theme.fn.hover({
				backgroundColor: theme.other.colors.primary.lightGray,
			}),
		},
		inner: {
			// color: theme.other.colors.secondary.black,
			color: `${theme.other.colors.secondary.black} !important`,
		},
		label: {
			left: `calc(${theme.spacing.md} * 2)`,
		},
		leftIcon: {
			display: 'none',
		},
	}),
	accent: (theme) => ({
		root: {
			paddingLeft: `calc(${theme.spacing.md} * 2)`,
			paddingRight: `calc(${theme.spacing.md} * 2)`,
			height: `calc(${theme.spacing.lg} * 2)`,
			backgroundColor: theme.other.colors.tertiary.red,
			'&:not([data-disabled])': theme.fn.hover({
				background: theme.fn.darken(theme.other.colors.tertiary.red, 0.4),
			}),
		},
		inner: {
			color: theme.other.colors.secondary.white,
		},
		label: {
			left: `calc(${theme.spacing.md} * 2)`,
		},
		leftIcon: {
			display: 'none',
		},
	}),
	primaryLg: (theme) => ({
		root: {
			borderRadius: theme.radius.md,
		},
		'&:not([data-disabled])': theme.fn.hover({
			backgroundColor: theme.fn.darken(theme.other.colors.secondary.white, 0.4),
		}),
	}),
	secondaryLg: (theme) => ({
		root: {
			border: theme.other.border.default,
			borderColor: theme.other.colors.tertiary.coolGray,
			backgroundColor: `${theme.other.colors.secondary.white} !important`,
			borderRadius: theme.radius.md,
			'&:not([data-disabled])': theme.fn.hover({
				backgroundColor: theme.other.colors.primary.lightGray,
			}),
		},
		inner: {
			color: `${theme.other.colors.secondary.black} !important`,
			'&:disabled, &[data-disabled]': {
				color: theme.other.colors.secondary.darkGray,
			},
		},
	}),
	accentLg: (theme) => ({
		root: {
			backgroundColor: theme.other.colors.secondary.cornflower,
			'&:not([data-disabled])': theme.fn.hover({
				background: theme.fn.darken(theme.other.colors.secondary.cornflower, 0.4),
			}),
		},
	}),
} satisfies VariantObj
