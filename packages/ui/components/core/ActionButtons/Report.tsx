import { Group, Menu, Text, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef } from 'react'

import { type ButtonProps } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'
import { ReportModal } from '~ui/modals/Report'

import classes from './styles.module.css'

export const Report = forwardRef<HTMLButtonElement, ReportProps>(
	(
		{
			itemId,
			itemName,
			menuItem,
			omitLabel,
			className,
			orgId,
			orgName,
			serviceId,
			serviceName,
			variant: _variant,
			...props
		},
		ref
	) => {
		const theme = useMantineTheme()
		const { t } = useTranslation('common')

		// Use ReportModal directly to preserve its polymorphic type signature
		// If you re-introduce QuickPromotionModal, ensure both share a compatible interface
		const BaseComponent = ReportModal

		const iconColor = menuItem ? undefined : theme.other.colors.secondary.black

		return (
			<BaseComponent
				component={menuItem ? Menu.Item : undefined}
				ref={ref}
				className={cx(!menuItem ? classes.button : undefined, className)}
				itemId={itemId}
				itemName={itemName}
				orgId={orgId}
				orgName={orgName}
				serviceId={serviceId}
				serviceName={serviceName}
				{...props}
			>
				<Group gap={0} wrap='nowrap'>
					<Icon
						icon='carbon:document'
						color={iconColor}
						className={classes.icon}
						height={menuItem ? 16 : 24}
						width={menuItem ? 16 : 24}
					/>
					{!omitLabel && (
						<Text c={menuItem ? undefined : iconColor} className={!menuItem ? classes.text : undefined}>
							{t('words.report')}
						</Text>
					)}
				</Group>
			</BaseComponent>
		)
	}
)
Report.displayName = 'ActionButtons.Report'

export interface ReportProps extends ButtonProps {
	itemId: string
	itemName: string
	menuItem?: boolean
	omitLabel?: boolean
	orgId?: string
	orgName?: string
	serviceId?: string
	serviceName?: string
}
