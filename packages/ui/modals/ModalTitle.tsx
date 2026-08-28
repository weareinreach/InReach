import { Box, Group, Text } from '@mantine/core'
import { type MouseEventHandler, useMemo } from 'react'

import { ActionButtons } from '~ui/components/core/ActionButtons'
import { Breadcrumb, type BreadcrumbProps, isValidBreadcrumbProps } from '~ui/components/core/Breadcrumb'
import { useCustomVariant } from '~ui/hooks'

export const ModalTitle = <TIcons extends ToolbarIcons[]>(props: _ModalTitleProps<TIcons>) => {
	const { breadcrumb, icons, rightText, serviceId, organizationId, itemName } = props
	const variants = useCustomVariant()
	if (!isValidBreadcrumbProps(breadcrumb)) {
		throw new Error('invalid Breadcrumb props')
	}

	const isService = !!serviceId
	// Narrow the type or use a cast to safely access navigation properties
	const bc = breadcrumb as { backToText?: string; currentPageText?: string }
	const reportOrgName = isService ? bc.backToText : bc.currentPageText || itemName // Org name for service, or item name for org
	const reportServiceName = isService ? bc.currentPageText || itemName : undefined // Service name if it's a service, otherwise undefined
	const displayItemName = (isService ? reportServiceName : reportOrgName) ?? itemName ?? '' // Concise name for modal title
	const iconMap = {
		save: (
			<ActionButtons.Save
				key='modal-title-save'
				omitLabel
				itemId={serviceId ?? ''}
				itemName={displayItemName}
			/>
		),
		share: <ActionButtons.Share key='modal-title-share' omitLabel />,
		report: (
			<ActionButtons.Report
				key='modal-title-report'
				omitLabel
				itemId={serviceId ?? organizationId ?? ''} // Primary ID for the report
				itemName={displayItemName} // A simple display name for the modal title
				orgId={organizationId}
				orgName={reportOrgName}
				serviceId={serviceId}
				serviceName={reportServiceName}
			/>
		),
	} as const

	const displayIcons = icons?.length ? icons.map((item) => iconMap[item]) : undefined

	const rightSection = useMemo(() => {
		if (displayIcons) {
			return (
				<Group justify='flex-end' gap={0} wrap='nowrap'>
					{displayIcons}
				</Group>
			)
		}
		if (rightText) {
			return <Text variant={variants.Text.utility1}>{rightText}</Text>
		}
		return null
	}, [displayIcons, rightText, variants])
	return (
		<Group justify='space-between' align='center' wrap='nowrap'>
			<Box maw='70%' style={{ overflow: 'hidden' }}>
				<Breadcrumb {...breadcrumb} />
			</Box>
			{rightSection}
		</Group>
	)
}

// type TitleIcons = keyof typeof iconMap

type ToolbarIcons = 'save' | 'share' | 'report'

type _ModalTitleProps<TIcons extends ToolbarIcons[]> = {
	breadcrumb: Omit<BreadcrumbProps, 'onClick'> & {
		onClick: MouseEventHandler<HTMLButtonElement> | (() => void)
	}
	icons?: TIcons
	rightText?: string
	serviceId?: 'save' extends TIcons[number] ? string : 'report' extends TIcons[number] ? string : never
	organizationId?: string
	itemName?: string
}
export type ModalTitleProps = _ModalTitleProps<ToolbarIcons[]>
