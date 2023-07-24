/* eslint-disable react/display-name */
import {
	type BadgeProps,
	type BadgeStylesNames,
	ColorSwatch,
	createStyles,
	type CSSObject,
	Divider,
	List,
	type ListProps,
	Badge as MantineBadge,
	type MantineTheme,
	rem,
	Text,
	Tooltip,
	type TooltipProps,
	useMantineTheme,
} from '@mantine/core'
import { type PolymorphicComponentProps } from '@mantine/utils'
import { type TOptions } from 'i18next'
import { DateTime } from 'luxon'
import { merge } from 'merge-anything'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode, useState } from 'react'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks'
import { Icon, type IconList, isValidIcon } from '~ui/icon'
import { ClaimOrgModal } from '~ui/modals/ClaimOrg'

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
					borderColor: theme.other.colors.secondary.white,
				},
				inner: {
					fontSize: theme.fontSizes.sm,
					[theme.fn.largerThan('sm')]: {
						fontSize: theme.fontSizes.md,
					},
				},
			}
		}
		case 'national':
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

		default:
			return {}
	}
}

const useVariantStyles = createStyles((theme, params: BadgeStylesParams) => badgeVariants(theme, params))
const useUnclaimedStyles = createStyles((theme) => ({
	root: theme.fn.hover({ cursor: 'pointer' }),
}))

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
	'remote',
	'national',
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
	remote: 'outline',
	national: 'outline',
} satisfies Record<CustomVariants, BadgeVariant | undefined>

/** Badge variants `serviceTag` and `communityTag` are responsive - the sizing changes at the `sm` breakpoint. */
export const Badge = forwardRef<HTMLDivElement, PolymorphicComponentProps<'div', CustomBadgeProps>>(
	(props, ref) => {
		const variants = useCustomVariant()
		const { t, i18n } = useTranslation(
			props.variant === 'national' ? ['common', 'attribute', 'country'] : ['common', 'attribute']
		)
		const isCustom = (customVariants as ReadonlyArray<string>).includes(props.variant ?? 'light')
		const theme = useMantineTheme()
		const { classes: baseClasses } = useVariantStyles({
			variant: props.variant ?? 'light',
			...(props.variant === 'leader' ? { minify: props.minify, hideBg: props.hideBg } : {}),
		})
		const { classes: unclaimedClasses } = useUnclaimedStyles()
		const { variant, classNames, ...others } = props as BadgeProps
		const [modalOpen, setModalOpen] = useState(false)

		const leftSection = (() => {
			switch (props.variant) {
				case 'leader': {
					return (
						<ColorSwatch color={props.iconBg} radius={24} size={24}>
							<span>{props.icon}</span>
						</ColorSwatch>
					)
				}
				case 'national': {
					return <Icon icon='carbon:globe' height={24} color={theme.other.colors.secondary.black} />
				}
				case 'verified': {
					return (
						<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={20} />
					)
				}
				case 'attribute': {
					return isValidIcon(props.icon) ? (
						<Icon icon={props.icon} height={24} color={theme.other.colors.secondary.black} />
					) : null
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
				case 'remote': {
					return <Icon icon='carbon:globe' height={20} color={theme.other.colors.secondary.black} />
				}
			}
		})()

		let passedBadgeProps: BadgeProps = others
		const children = (() => {
			switch (props.variant) {
				case 'leader': {
					const { tsKey, minify, hideBg: _, variant: _variant, iconBg: _iconBg, ...rest } = props
					passedBadgeProps = rest
					return minify ? null : <Text fw={500}>{t(tsKey, { ns: 'attribute' })}</Text>
				}
				case 'verified': {
					return <Text>{t('verified-information')}</Text>
				}
				case 'attribute': {
					const { tsKey, tsNs, tProps, variant: _variant, ...rest } = props
					passedBadgeProps = rest
					return <Text>{t(tsKey, { ns: tsNs, ...tProps })}</Text>
				}
				case 'community': {
					const { tsKey, tProps, variant: _variant, ...rest } = props
					passedBadgeProps = rest
					return t(tsKey, { ns: 'attribute', ...tProps })
				}
				case 'service': {
					const { tsKey, tProps, variant: _variant, ...rest } = props
					passedBadgeProps = rest
					return t(tsKey, { ns: 'services', ...tProps })
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
				case 'community': {
					return {
						label: t('badge.community-tool-tip'),
					}
				}
				case 'remote': {
					return {
						label: t('badge.remote-tool-tip'),
					}
				}
				case 'service': {
					return {
						label: t('badge.service-tool-tip'),
					}
				}
				case 'national': {
					if (Array.isArray(props.tsKey)) {
						const formatter = new Intl.ListFormat(i18n.resolvedLanguage, {
							style: 'long',
							type: 'conjunction',
						})
						return {
							label: t('badge.national-tool-tip', {
								country: formatter.format(props.tsKey.map((country) => `$t(country:${country}.name)`)),
								interpolation: { skipOnVariables: false },
							}),
						}
					}
					return {
						label: t('badge.national-tool-tip', {
							country: `$t(country:${props.tsKey}.name)`,
							interpolation: { skipOnVariables: false },
						}),
					}
				}
				case 'leader': {
					return {
						label: t('adjective.organization', { ns: 'common', adjective: `$t(attribute:${props.tsKey})` }), //t(props.tsKey, { ns: 'attribute' }),
						disabled: !props.minify,
					}
				}
				case 'verified': {
					const lastVerified =
						props.lastverified instanceof Date ? props.lastverified : new Date(props.lastverified)

					const dateString = DateTime.fromJSDate(lastVerified)
						.setLocale(i18n.resolvedLanguage ?? 'en')
						.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
					const label = t('verified-information-detail', { dateString })

					return {
						label,
						multiline: true,
						maw: { base: '90vw', xs: 600 },
					}
				}
				case 'claimed': {
					const label = (
						<Trans
							i18nKey='badge.claimed-tool-tip'
							components={{
								link1: (
									<Link
										external
										href='https://inreach.org/claimed-organizations/'
										variant={variants.Link.inheritStyle}
									/>
								),
							}}
						/>
					)
					return {
						label,
						multiline: true,
						closeDelay: 500,
						style: { pointerEvents: 'auto' },
						maw: { base: '90vw', xs: 600 },
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
			...(props.variant === 'leader' && props.minify ? { 'data-minify': true } : {}),
			...(props.variant === 'leader' && props.hideBg ? { 'data-hidebg': true } : {}),
		}

		const badge = (
			<MantineBadge
				variant={mantineVariant}
				classNames={merge(classNames, baseClasses)}
				ref={ref}
				leftSection={leftSection}
				w='fit-content'
				{...styleDataProps}
				{...passedBadgeProps}
			>
				{children}
			</MantineBadge>
		)
		if (props.variant === 'unclaimed') {
			const label = (
				<Trans
					i18nKey='badge.unclaimed-tool-tip'
					components={{
						link1: <Link external onClick={() => setModalOpen(true)} variant={variants.Link.inheritStyle} />,
					}}
				/>
			)
			return (
				<Tooltip
					style={{ pointerEvents: 'auto' }}
					closeDelay={500}
					label={label}
					events={{ hover: true, focus: true, touch: true }}
					multiline
					variant={variants.Tooltip.utility1}
					px={16}
					py={10}
					maw={{ base: '90vw', xs: 600 }}
				>
					<ClaimOrgModal
						component={MantineBadge}
						variant={mantineVariant}
						classNames={merge(classNames, baseClasses)}
						className={unclaimedClasses.root}
						ref={ref}
						leftSection={leftSection}
						w='fit-content'
						externalOpen={modalOpen}
						externalStateHandler={setModalOpen}
						{...styleDataProps}
						{...passedBadgeProps}
					>
						{children}
					</ClaimOrgModal>
				</Tooltip>
			)
		}

		if (renderTooltip) {
			return (
				<Tooltip
					multiline
					variant={variants.Tooltip.utility1}
					px={16}
					py={10}
					events={{ hover: true, focus: true, touch: true }}
					{...renderTooltip}
				>
					{badge}
				</Tooltip>
			)
		}
		return badge
	}
)

export const BadgeGroup = ({ badges, withSeparator = false, ...props }: BadgeGroupProps) => {
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const separator = (
		<Divider w={4} size={4} style={{ borderRadius: '50%' }} color={theme.other.colors.secondary.black} />
	)
	const badgeList = badges.map((item: CustomBadgeProps, idx, arr) => (
		<List.Item key={idx}>
			<Badge {...item} />
		</List.Item>
	))

	return (
		<List
			variant={withSeparator ? variants.List.inlineBullet : variants.List.inline}
			icon={withSeparator ? separator : undefined}
			m={0}
			{...props}
		>
			{badgeList}
		</List>
	)
}

interface BadgeGroupProps extends Omit<ListProps, 'children'> {
	badges: CustomBadgeProps[]
	withSeparator?: boolean
}
type BadgeVariant = BadgeProps['variant']

interface BadgeStylesParams {
	variant?: BadgeVariant | CustomVariants
	minify?: boolean
	hideBg?: boolean
}
export type CustomBadgeProps =
	| (Omit<BadgeProps, 'variant'> & {
			/** Preset designs */
			variant?:
				| Exclude<CustomVariants, 'leader' | 'verified' | 'attribute' | 'community' | 'service' | 'national'>
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
	| NationalBadgeProps
type CustomVariants = (typeof customVariants)[number]

export type CustomBadgeStyles = Partial<{ [className in BadgeStylesNames]: CSSObject }>
type BadgeVariants = (theme: MantineTheme, params: BadgeStylesParams) => CustomBadgeStyles

type LeaderBadgeProps = {
	variant: 'leader'
	/** Background color for icon */
	iconBg: string
	/** Unicode emoji string */
	icon: string
	/** I18n translation key */
	tsKey: string
	/** Show icon only? */
	minify?: boolean
	/** Hide light gray bg for mini */
	hideBg?: boolean
}
type NationalBadgeProps = {
	variant: 'national'
	/** Translation key for the country name(s) */
	tsKey: string | string[]
}

type VerifiedBadgeProps = {
	variant: 'verified'
	lastverified: Date | string
}

export type AttributeTagProps = {
	variant: 'attribute'
	icon: IconList | string
	tsKey: string
	tsNs: string
	tProps?: Omit<TOptions, 'ns'>
}

export type CommunityTagProps = {
	variant: 'community'
	icon: string
	tsKey: string
	tProps?: Omit<TOptions, 'ns'>
}
export type ServiceTagProps = {
	variant: 'service'
	tsKey: string
	tProps?: Omit<TOptions, 'ns'>
}
