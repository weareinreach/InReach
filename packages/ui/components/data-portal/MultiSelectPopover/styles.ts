import { createStyles, rem } from '@mantine/core'

export const useStyles = createStyles(
	(theme, { selectedCount, dimmed }: { selectedCount: number; dimmed: boolean }) => ({
		count: {
			...theme.other.utilityFonts.utility1,
			background: dimmed ? theme.other.colors.secondary.darkGray : theme.other.colors.secondary.black,
			borderRadius: '100%',
			color: theme.other.colors.secondary.white,
			width: rem(24),
			height: rem(24),
			textAlign: 'center',
			display: 'inline-block',
			verticalAlign: 'center',
			lineHeight: 1.5,
			opacity: selectedCount < 1 ? 0 : 1,
		},
		button: {
			padding: `${rem(14)} ${rem(16)}`,
			backgroundColor: theme.other.colors.secondary.white,
			borderRadius: rem(8),
			border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
			height: rem(48),
		},
		indicateDirty: {
			'&[data-isDirty=true]': {
				backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.6),
			},
		},
	})
)
