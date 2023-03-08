import { rem } from '@mantine/core'

import { VariantDef, VariantObj } from '~ui/types/mantine'

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

export const Badge = {
	community: (theme) => ({
		root: {
			height: theme.spacing.xl,
			backgroundColor: theme.other.colors.secondary.white,
			borderColor: theme.other.colors.tertiary.coolGray,
			[theme.fn.largerThan('sm')]: {
				height: `calc(${theme.spacing.xl} + ${rem(8)}`,
			},
		},
		inner: {
			paddingTop: `calc(${theme.spacing.sm} / 4)`,
			paddingBottom: `calc(${theme.spacing.sm} / 4)`,
			fontSize: theme.fontSizes.sm,
			[theme.fn.largerThan('sm')]: {
				paddingTop: `calc(${theme.spacing.sm} / 2)`,
				paddingBottom: `calc(${theme.spacing.sm} / 2)`,
				fontSize: theme.fontSizes.md,
			},
		},
		leftSection: {
			paddingTop: `calc(${theme.spacing.sm} / 4)`,
			paddingBottom: `calc(${theme.spacing.sm} / 4)`,
			paddingRight: theme.spacing.xs,
			fontSize: theme.fontSizes.sm,
			marginRight: 0,
			[theme.fn.largerThan('sm')]: {
				paddingTop: `calc(${theme.spacing.sm} / 2)`,
				paddingBottom: `calc(${theme.spacing.sm} / 2)`,
				fontSize: theme.fontSizes.md,
			},
		},
	}),
	service: (theme) => ({
		root: {
			height: theme.spacing.xl,
			backgroundColor: theme.other.colors.primary.lightGray,
			border: 'none',
			[theme.fn.largerThan('sm')]: {
				height: `calc(${theme.spacing.xl} - ${rem(8)})`,
			},
		},
		inner: {
			paddingTop: `calc(${theme.spacing.sm} / 4)`,
			paddingBottom: `calc(${theme.spacing.sm} / 4)`,
			fontSize: theme.fontSizes.sm,
			[theme.fn.largerThan('sm')]: {
				paddingTop: `calc(${theme.spacing.sm} / 2)`,
				paddingBottom: `calc(${theme.spacing.sm} / 2)`,
				fontSize: theme.fontSizes.md,
			},
		},
	}),
	leader: (theme) => ({
		leftSection: {
			'& *': {
				fontSize: theme.fontSizes.xs,
				borderRadius: theme.radius.xl,
				height: rem(24),
				width: rem(24),
				margin: 0,
				textAlign: 'center',
				paddingBottom: rem(4),
			},
		},
		inner: {
			'& *': {
				color: theme.other.colors.secondary.black,
				marginLeft: theme.spacing.xs,
			},
		},
		root: {
			border: 0,
			padding: 0,
			'&[data-minify]': {
				height: rem(40),
				width: rem(40),
				...theme.fn.hover({
					backgroundColor: theme.other.colors.primary.lightGray,
				}),
				radius: theme.radius.xl,
				padding: 0,
			},
			'&[data-hideBg]': {
				backgroundColor: undefined,
				height: undefined,
				width: undefined,
				paddingLeft: rem(6),
				paddingRight: rem(6),
			},
		},
	}),
	attributeBadge: (theme) => ({
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
	}),
	privatePractice: attributeBadge,
	claimed: attributeBadge,
	unclaimed: attributeBadge,
	verified: attributeBadge,
	attribute: attributeBadge,
} satisfies VariantObj
