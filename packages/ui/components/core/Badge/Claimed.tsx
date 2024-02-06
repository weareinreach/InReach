import { Badge, type BadgeProps, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, useState } from 'react'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { ClaimOrgModal } from '~ui/modals'

import { useSharedStyles } from './styles'

export const _Claimed = forwardRef<HTMLDivElement, BadgeClaimedProps>(
	({ hideTooltip, isClaimed, ...props }, ref) => {
		const { classes } = useSharedStyles(isClaimed ? 'claimed' : 'unclaimed')
		const theme = useMantineTheme()
		const { t } = useTranslation('common')
		const variants = useCustomVariant()
		const [modalOpen, setModalOpen] = useState(false)

		const leftSection = isClaimed ? (
			<Icon icon='carbon:checkmark-filled' color={theme.other.colors.secondary.cornflower} height={20} />
		) : (
			<Icon icon='carbon:help-filled' color={theme.other.colors.tertiary.orange} height={20} />
		)
		const badgeProps = {
			variant: 'outline',
			classNames: classes,
			leftSection,
			...(isClaimed ? { ref } : {}),
			...props,
		} as const

		const badge = isClaimed ? (
			<Badge {...badgeProps}>
				<Text>{t('badge.claimed')}</Text>
			</Badge>
		) : (
			<Text>{t('badge.unclaimed')}</Text>
		)
		const label = isClaimed ? (
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
		) : (
			<Trans
				i18nKey='badge.unclaimed-tool-tip'
				components={{
					link1: <Link external onClick={() => setModalOpen(true)} variant={variants.Link.inheritStyle} />,
				}}
			/>
		)

		const tooltipProps = {
			label,
			multiline: true,
			maw: { base: '90vw', xs: 600 },
			closeDelay: 500,
			style: { pointerEvents: 'auto' },
			events: { hover: true, focus: true, touch: true },
			variant: variants.Tooltip.utility1,
			disabled: hideTooltip,
			...(!isClaimed
				? {
						px: 16,
						py: 10,
						ref,
					}
				: {}),
		} as const

		const claimOrgModalProps = {
			component: Badge,
			...badgeProps,
			w: 'fit-content',
			externalOpen: modalOpen,
			externalStateHandler: setModalOpen,
			className: classes.root,
		} as const

		return isClaimed ? (
			<Tooltip {...tooltipProps}>{badge}</Tooltip>
		) : (
			<Tooltip {...tooltipProps}>
				<ClaimOrgModal {...claimOrgModalProps}>{badge}</ClaimOrgModal>
			</Tooltip>
		)
	}
)
_Claimed.displayName = 'Badge.Claimed'

export interface BadgeClaimedProps extends BadgeProps {
	hideTooltip?: boolean
	isClaimed?: boolean
}
