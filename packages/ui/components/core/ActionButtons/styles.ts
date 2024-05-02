import { createStyles, rem } from '@mantine/core'

export const useStyles = createStyles((theme) => ({
	button: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		// minWidth: rem(48),
		minWidth: 'fit-content',
		height: rem(48),
		padding: rem(12),
		gap: rem(8),
		backgroundColor: theme.other.colors.secondary.white,
		border: 0,
		borderRadius: rem(8),
		'&:not([data-disabled])': theme.fn.hover({
			backgroundColor: theme.other.colors.primary.lightGray,
		}),
	},
	buttonPressed: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: rem(48),
		height: rem(48),
		padding: rem(12),
		gap: rem(8),
		backgroundColor: theme.other.colors.primary.lightGray,
		'&:not([data-disabled])': theme.fn.hover({
			backgroundColor: theme.other.colors.primary.lightGray,
		}),
	},
	icon: {
		color: theme.other.colors.secondary.black,
	},
	text: {
		fontWeight: theme.other.fontWeight.semibold,
		marginLeft: rem(8),
	},
	dropdown: {
		background: theme.other.colors.secondary.black,
		borderRadius: theme.radius.md,
		paddingTop: rem(2),
		paddingBottom: rem(2),
	},
	item: {
		'& > *': {
			color: 'white !important',
		},
		color: 'white',
		fontWeight: theme.other.fontWeight.semibold,
		fontSize: theme.fontSizes.md,
		'&[data-hovered]': {
			backgroundColor: 'inherit',
			// color: 'black',
			textDecoration: 'underline',
		},
	},
	inOverflowMenu: {
		border: 'none !important',
		padding: 0,
		backgroundColor: 'inherit',
		...theme.fn.hover({
			backgroundColor: 'transparent !important',
		}),
		height: 'unset',
		'&.mantine-Group-root, .mantine-Text-root, .iconify-icon-root, .mantine-Menu-item': {
			color: theme.other.colors.secondary.white,
			// ...theme.fn.hover({
			// 	backgroundColor: 'transparent !important',
			// }),
		},
	},
}))
