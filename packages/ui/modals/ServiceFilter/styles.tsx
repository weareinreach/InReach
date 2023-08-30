import { createStyles, em, rem } from '@mantine/core'

export const useAccordionStyles = createStyles((theme) => ({
	label: {
		...theme.other.utilityFonts.utility1,
	},
	content: {
		padding: `${rem(0)} ${rem(0)} ${rem(12)} ${rem(0)}`,
	},
	item: {
		margin: 0,
		minHeight: rem(48),
		'&:last-of-type': {
			marginBottom: rem(40),
		},
	},
	chevron: { '&[data-rotate]': { transform: 'rotate(90deg)' } },
	scrollArea: {
		paddingRight: rem(12),
	},
	control: {
		// padding: `${rem(12)} ${rem(0)}`,
		padding: 0,
		...theme.fn.hover({
			backgroundColor: theme.other.colors.primary.lightGray,
		}),
	},
	panel: {
		padding: 0,
	},
}))

export const useModalStyles = createStyles((theme) => ({
	body: {
		padding: `${rem(10)} ${rem(4)} ${rem(10)} ${rem(16)}`,
		[theme.fn.largerThan('xs')]: {
			padding: `${rem(40)} ${rem(8)} ${rem(20)} ${rem(20)}`,
		},
		[theme.fn.largerThan('sm')]: {
			padding: `${rem(40)} ${rem(20)} ${rem(20)} ${rem(32)}`,
		},
		[theme.fn.smallerThan('sm')]: {
			maxHeight: 'none',
			padding: `${rem(10)} ${rem(9)} ${rem(30)} ${rem(20)}`,
		},
		[`@media (orientation: landscape) and (max-height: ${em(376)})`]: {
			paddingBottom: rem(20),
		},
		[`@media (orientation: landscape) and (max-height: ${em(430)})`]: {
			maxHeight: 'none',
			paddingTop: rem(20),
		},
	},
	title: {
		padding: `${rem(8)} ${rem(0)} ${rem(8)} ${rem(8)}`,
		width: '100%',
	},
	header: {},
	modal: {},
	footer: {
		borderTop: `solid ${rem(1)} ${theme.other.colors.primary.lightGray}`,
		padding: `${rem(20)} ${rem(12)} ${rem(0)} ${rem(0)}`,
		[theme.fn.smallerThan('sm')]: {
			padding: `${rem(32)} ${rem(12)} ${rem(0)} ${rem(0)}`,
		},
		[`${theme.fn.smallerThan(em(375))}, (orientation: landscape) and (max-height: ${em(376)})`]: {
			paddingTop: rem(20),
		},
	},
}))

export const useStyles = createStyles((theme) => ({
	label: {
		...theme.other.utilityFonts.utility1,
		[theme.fn.smallerThan('sm')]: {
			textAlign: 'center',
		},
		'&[data-disabled]': {
			color: theme.other.colors.secondary.darkGray,
		},
	},
	launchButton: {
		'&:disabled, &[data-disabled]': {
			color: theme.other.colors.secondary.darkGray,
			pointerEvents: 'none',
		},
	},
	count: {
		...theme.other.utilityFonts.utility1,
		background: theme.other.colors.secondary.black,
		borderRadius: '100%',
		color: theme.other.colors.secondary.white,
		width: rem(24),
		height: rem(24),
		textAlign: 'center',
		display: 'inline-block',
		verticalAlign: 'center',
		lineHeight: 1.5,
	},

	button: {
		padding: `${rem(14)} ${rem(16)}`,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(8),
		border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
		height: rem(48),
		'&:disabled, &[data-disabled]': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},

	itemParent: {},
	itemChild: {
		marginLeft: rem(40),
	},
	uncheck: {
		color: theme.other.colors.secondary.black,
		textDecoration: 'underline',
		'&:hover': {
			textDecoration: 'underline',
			backgroundColor: theme.other.colors.primary.lightGray,
			color: theme.other.colors.secondary.black,
			cursor: 'pointer',
		},
		[`${theme.fn.smallerThan('sm')}, not (orientation: landscape) and (max-height: ${theme.breakpoints.xs})`]:
			{
				display: 'none',
			},
	},
	uncheckDisabled: {
		textDecoration: 'underline',
		color: theme.other.colors.secondary.darkGray,
		'&:hover': {
			cursor: 'not-allowed',
		},
		[`${theme.fn.smallerThan('sm')}, not (orientation: landscape) and (max-height: ${theme.breakpoints.xs})`]:
			{
				display: 'none',
			},
	},
	uncheckBtn: {
		width: '50%',
		borderRadius: rem(8),
		padding: `${rem(6)} ${rem(8)}`,
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
		[theme.fn.smallerThan(em(375))]: {
			marginRight: 'unset',
			'& *': {
				fontSize: `${rem(14)} !important`,
			},
		},
		height: rem(48),
	},
	resultsBtn: {
		borderRadius: rem(8),
		[theme.fn.smallerThan('sm')]: {
			width: '50%',
			padding: `${rem(6)} ${rem(8)}`,
		},
		[theme.fn.smallerThan(em(375))]: {
			marginLeft: 'unset',
			'& *': {
				fontSize: `${rem(14)} !important`,
			},
		},
		width: '100%',
		height: rem(48),
	},
}))
