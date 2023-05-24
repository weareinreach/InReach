import { Box, Group, Text } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { type DefaultTFuncReturn } from 'i18next'
import { type MouseEventHandler } from 'react'

import { ActionButtons } from '~ui/components/core/ActionButtons'
import {
	Breadcrumb,
	type BreadcrumbProps,
	isValidBreadcrumbProps,
	type ModalTitleBreadcrumb,
} from '~ui/components/core/Breadcrumb'
import { useCustomVariant } from '~ui/hooks'

export const ModalTitle = (props: ModalTitleProps) => {
	const { breadcrumb, icons, rightText, serviceId } = props
	const variants = useCustomVariant()
	if (!isValidBreadcrumbProps(breadcrumb)) throw new Error('invalid Breadcrumb props')
	const iconMap = {
		save: <ActionButtons key='modal-title-save' iconKey='save' omitLabel serviceId={serviceId} />,
		share: <ActionButtons key='modal-title-share' iconKey='share' omitLabel />,
	} as const

	const displayIcons = icons?.length ? icons.map((item) => iconMap[item]) : undefined

	const rightSection = displayIcons ? (
		<Group position='right' spacing={0} noWrap>
			{displayIcons}
		</Group>
	) : rightText ? (
		<Text variant={variants.Text.utility1}>{rightText}</Text>
	) : null
	return (
		<Group position='apart' align='center' noWrap>
			<Box maw='70%' style={{ overflow: 'hidden' }}>
				<Breadcrumb onClick={() => closeAllModals()} {...breadcrumb} />
			</Box>
			{rightSection}
		</Group>
	)
}

// type TitleIcons = keyof typeof iconMap

export type ModalTitleProps = {
	breadcrumb: Omit<BreadcrumbProps, 'onClick'> & {
		onClick?: MouseEventHandler<HTMLButtonElement>
	}
	icons?: ('save' | 'share')[]
	rightText?: string | DefaultTFuncReturn
	serviceId?: string
}
