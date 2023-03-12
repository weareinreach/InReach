/* eslint-disable react/display-name */
import {
	Badge as MantineBadge,
	BadgeProps,
	CSSObject,
	createStyles,
	BadgeStylesNames,
	MantineTheme,
	ColorSwatch,
	useMantineTheme,
	Text,
	Tooltip,
	TooltipProps,
	Group,
	rem,
} from '@mantine/core'
import { PolymorphicComponentProps } from '@mantine/utils'
import { DateTime } from 'luxon'
import { merge } from 'merge-anything'
import { useTranslation } from 'next-i18next'
import { forwardRef, ReactNode } from 'react'

import { Icon, IconList } from '~ui/icon'

const badgeVariants: BadgeVariants = (theme, params) => {
	switch (params.variant) {
		case 'community': {
			return {
				root: {
					backgroundColor: theme.other.colors.secondary.white,
					borderColor: theme.other.colors.tertiary.coolGray,
				},
				inner: {
					fontSize: theme.fontSizes.sm,
					[theme.fn.largerThan('sm')]: {
						fontSize: theme.fontSizes.md,
					},
				},
				leftSection: {
					fontSize: theme.fontSizes.sm,
					marginRight: rem(6),
					[theme.fn.largerThan('sm')]: {
						fontSize: theme.fontSizes.md,
					},
				},
			}
		}
		case 'service': {
			return {
				root: {
					backgroundColor: theme.other.colors.primary.lightGray,
					border: 'none',
				},
				inner: {
					fontSize: theme.fontSizes.sm,
					[theme.fn.largerThan('sm')]: {
						fontSize: theme.fontSizes.md,
					},
				},
			}
		}
		case 'leader': {
			return {
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
					// padding: 0,
					'&[data-minify]': {
						height: rem(40),
						width: rem(40),
						['&:hover']: {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
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
			}
		}

		default:
			return {}
	}
}

const useVariantStyles = createStyles((theme, params: BadgeStylesParams) => badgeVariants(theme, params))

const customVariants = [
	'community',
	'service',
	'leader',
	'verified',
	'claimed',
	'unclaimed',
	'attribute',
	'privatePractice',
	'verifiedReviewer',
] as const

const customVariantMap = {
	community: undefined,
	service: undefined,
	leader: 'outline',
	verified: 'outline',
	claimed: 'outline',
	unclaimed: 'outline',
	attribute: 'outline',
	privatePractice: 'outline',
	verifiedReviewer: 'outline',
} satisfies Record<CustomVariants, BadgeVariant | undefined>

/** Badge variants `serviceTag` and `communityTag` are responsive - the sizing changes at the `sm` breakpoint. */
export const Badge = forwardRef<HTMLDivElement, PolymorphicComponentProps<'div', CustomBadgeProps>>(
	(props, ref) => {
		const theme = useMantineTheme()
		const { t, i18n } = useTranslation(['common', 'attribute'])
		const isCustom = (customVariants as ReadonlyArray<string>).includes(props.variant ?? 'light')
		const { classes: baseClasses } = useVariantStyles({
			variant: props.variant ?? 'light',
			...(props.variant === 'leader' ? { minify: props.minify, hideBg: props.hideBg } : {}),
		})
		const { variant, classNames, ...others } = props as BadgeProps

		const leftSection = (() => {
			switch (props.variant) {
				case 'leader': {
					return (
						<ColorSwatch color={props.color} radius={24} size={24}>
							<span>{props.icon}</span>
						</ColorSwatch>
					)
				}
				case 'verified': {
					return (
						<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={20} />
					)
				}
				case 'attribute': {
					return <Icon icon={props.icon} height={24} color={theme.other.colors.secondary.black} />
				}
				case 'community': {
					return props.icon
				}
				case 'claimed': {
					return (
						<Icon
							icon='carbon:checkmark-filled'
							color={theme.other.colors.secondary.cornflower}
							height={20}
						/>
					)
				}
				case 'unclaimed': {
					return <Icon icon='carbon:help-filled' color={theme.other.colors.tertiary.orange} height={20} />
				}
				case 'privatePractice': {
					return (
						<Icon icon='carbon:location-person-filled' color={theme.other.colors.tertiary.pink} height={24} />
					)
				}
				case 'verifiedReviewer': {
					return (
						<Icon icon='carbon:checkmark-filled' height={20} color={theme.other.colors.primary.allyGreen} />
					)
				}
			}
		})()

		const children = (() => {
			switch (props.variant) {
				case 'leader': {
					return props.minify ? null : <Text fw={500}>{t(props.tsKey, { ns: 'attribute' })}</Text>
				}
				case 'verified': {
					return <Text>{t('verified-information')}</Text>
				}
				case 'attribute': {
					return <Text>{t(props.tsKey, { ns: props.tsNs })}</Text>
				}
				case 'community': {
					return t(props.tsKey, { ns: 'attribute' })
				}
				case 'service': {
					return t(props.tsKey, { ns: 'services' })
				}
				case 'claimed': {
					return <Text>{t('claimed')}</Text>
				}
				case 'unclaimed': {
					return <Text>{t('unclaimed')}</Text>
				}
				case 'privatePractice': {
					return <Text>{t('privatePractice')}</Text>
				}
				case 'verifiedReviewer': {
					return <Text color={theme.other.colors.secondary.darkGray}>{t('in-reach-verified-reviewer')}</Text>
				}
				default: {
					return props.children
				}
			}
		})()

		const renderTooltip: Omit<TooltipProps, 'children'> | undefined = (() => {
			switch (props.variant) {
				case 'leader': {
					return {
						label: t(`${props.tsKey}-org`, { ns: 'attribute' }),
						disabled: !props.minify,
					}
				}
				case 'verified': {
					const MAX_CHARACTERS = 80
					const dateString = DateTime.fromJSDate(props.lastVerifiedDate)
						.setLocale(i18n.resolvedLanguage)
						.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
					const label = t('verified-information-detail', { dateString })
					return {
						label,
						multiline: true,
						width: label.length > MAX_CHARACTERS ? 600 : 'auto',
					}
				}
			}
		})()

		const mantineVariant = isCustom
			? variant
				? customVariantMap[variant as CustomVariants]
				: undefined
			: (variant as BadgeVariant)

		const styleDataProps = {
			'data-minify': (props.variant === 'leader' && props.minify) || undefined,
			'data-hideBg': (props.variant === 'leader' && props.hideBg) || undefined,
		}

		const badge = (
			<MantineBadge
				variant={mantineVariant}
				classNames={merge(classNames, baseClasses)}
				ref={ref}
				leftSection={leftSection}
				{...styleDataProps}
				{...others}
			>
				{children}
			</MantineBadge>
		)

		if (renderTooltip) {
			return <Tooltip {...renderTooltip}>{badge}</Tooltip>
		}
		return badge
	}
)

const useGroupStyles = createStyles((theme) => ({
	separator: {
		fontSize: '1.5rem',
		display: 'inline',
		paddingLeft: theme.spacing.xs,
		paddingRight: theme.spacing.xs,
	},
}))

export const BadgeGroup = ({ badges, withSeparator = false }: BadgeGroupProps) => {
	const { classes } = useGroupStyles()

	const WithSeparator = (item: CustomBadgeProps) => (
		<>
			<Badge {...item} />
			<Text className={classes.separator} inline>{`\u2022`}</Text>
		</>
	)
	const isLeaderMini = (item: CustomBadgeProps) => (item.variant === 'leader' ? !item.minify : true)
	const badgeList = badges.map((item: CustomBadgeProps, idx, arr) =>
		idx + 1 !== arr.length && isLeaderMini(item) && withSeparator ? (
			<WithSeparator key={idx} {...item} />
		) : (
			<Badge key={idx} {...item} />
		)
	)

	return (
		<Group position='left' spacing={withSeparator ? 1 : 16}>
			{badgeList}
		</Group>
	)
}
type BadgeGroupProps = {
	badges: CustomBadgeProps[]
	withSeparator: boolean
}
type BadgeVariant = BadgeProps['variant']

interface BadgeStylesParams {
	variant?: BadgeVariant | CustomVariants
	minify?: boolean
	hideBg?: boolean
}
type CustomBadgeProps =
	| (Omit<BadgeProps, 'variant'> & {
			/** Preset designs */
			variant?:
				| Exclude<CustomVariants, 'leader' | 'verified' | 'attribute' | 'community' | 'service'>
				| 'outline'
			/**
			 * Item rendered on the left side of the badge. Should be either an emoji unicode string or an Icon
			 * component
			 */
			leftSection?: ReactNode
	  })
	| LeaderBadgeProps
	| VerifiedBadgeProps
	| AttributeTagProps
	| CommunityTagProps
	| ServiceTagProps
type CustomVariants = (typeof customVariants)[number]

export type CustomBadgeStyles = Partial<{ [className in BadgeStylesNames]: CSSObject }>
type BadgeVariants = (theme: MantineTheme, params: BadgeStylesParams) => CustomBadgeStyles

type LeaderBadgeProps = {
	variant: 'leader'
	/** Background color for icon */
	color: string
	/** Unicode emoji string */
	icon: string
	/** I18n translation key */
	tsKey: string
	/** Show icon only? */
	minify?: boolean
	/** Hide light gray bg for mini */
	hideBg?: boolean
}

type VerifiedBadgeProps = {
	variant: 'verified'
	lastVerifiedDate: Date
}

type AttributeTagProps = {
	variant: 'attribute'
	icon: IconList
	tsKey: string
	tsNs: string
}

export type CommunityTagProps = {
	variant: 'community'
	icon: string
	tsKey: string
}
type ServiceTagProps = {
	variant: 'service'
	tsKey: string
}
