import { Badge, type BadgeProps, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
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

		const badgePropsTemp = {
			variant: 'outline',
			classNames: classes,
			leftSection,
			...(isClaimed ? { ref } : {}),
			...props,
		} as const

		const claimOrgModalPropsTemp = {
			component: Badge,
			...badgePropsTemp,
			w: 'fit-content',
			externalOpen: modalOpen,
			externalStateHandler: setModalOpen,
			className: classes.root,
		} as const

		return (
			<ClaimOrgModal {...claimOrgModalPropsTemp}>
				<Link external onClick={() => setModalOpen(true)} variant={variants.Link.inheritStyle}>
					{t('words.coming-soon')}
				</Link>
			</ClaimOrgModal>
		)
	}
)
_Claimed.displayName = 'Badge.Claimed'

export interface BadgeClaimedProps extends BadgeProps {
	hideTooltip?: boolean
	isClaimed?: boolean
}
