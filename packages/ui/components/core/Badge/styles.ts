import { type BadgeStylesNames, createStyles, type CSSObject, type MantineTheme, rem } from '@mantine/core'

export const useSharedStyles = (variant: SharedStyles) => {
	const styles = (theme: MantineTheme): Partial<{ [className in BadgeStylesNames]: CSSObject }> => {
		switch (variant) {
			case 'leader':
			case 'national': {
				return {
					leftSection: {
						alignSelf: 'center',
						lineHeight: variant === 'national' ? 0 : undefined,
						'& *': {
							fontSize: theme.fontSizes.xs,
							borderRadius: theme.radius.xl,
							height: rem(24),
							width: rem(24),
							margin: 0,
							textAlign: 'center',
							paddingBottom: variant === 'leader' ? rem(4) : 0,
							color: theme.other.colors.secondary.black,
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
							['&:hover']: {
								backgroundColor: theme.other.colors.primary.lightGray,
							},
							radius: theme.radius.xl,
							padding: 0,
						},
						'&[data-hidebg]': {
							backgroundColor: undefined,
							height: undefined,
							width: undefined,
							paddingLeft: rem(6),
							paddingRight: rem(6),
						},
					},
				}
			}
			case 'privatePractice':
			case 'claimed':
			case 'unclaimed':
			case 'verified':
			case 'verifiedReviewer':
			case 'attribute': {
				return {
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
						minHeight: rem(24),
						padding: '0',
						lineHeight: 'inherit',
						borderRadius: 0,
					},
					leftSection: {
						height: rem(24),
					},
				}
			}
			case 'remote': {
				return {
					root: {
						border: 0,
						height: rem(20),
						padding: '0',
						lineHeight: 'inherit',
						borderRadius: 0,
					},
					leftSection: {
						height: rem(20),
					},
				}
			}
		}
	}

	return createStyles(styles)()
}

type SharedStyles =
	| 'national'
	| 'leader'
	| 'privatePractice'
	| 'claimed'
	| 'unclaimed'
	| 'verified'
	| 'verifiedReviewer'
	| 'attribute'
	| 'remote'

// type CustomBadgeStyles = Partial<{ [className in BadgeStylesNames]: CSSObject }>

// type UseSharedStyles = (variant: SharedStyles) => CustomBadgeStyles
