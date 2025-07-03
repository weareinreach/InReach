import { Box, Group, Text } from '@mantine/core'
import { type MouseEventHandler, useMemo } from 'react'

import { ActionButtons } from '~ui/components/core/ActionButtons'
import { Breadcrumb, type BreadcrumbProps, isValidBreadcrumbProps } from '~ui/components/core/Breadcrumb'
import { useCustomVariant } from '~ui/hooks'

export const ModalTitle = <TIcons extends ToolbarIcons[]>(props: _ModalTitleProps<TIcons>) => {
	const { breadcrumb, icons, rightText, serviceId, maxWidth = '70%' } = props
	const variants = useCustomVariant()
	if (!isValidBreadcrumbProps(breadcrumb)) {
		throw new Error('invalid Breadcrumb props')
	}
	const iconMap = {
		save: (
			<ActionButtons.Save
				key='modal-title-save'
				omitLabel
				itemId={serviceId ?? ''}
				itemName={breadcrumb.backToText ?? ''}
			/>
		),
		share: <ActionButtons.Share key='modal-title-share' omitLabel />,
	} as const

	const displayIcons = icons?.length ? icons.map((item) => iconMap[item]) : undefined

	const rightSection = useMemo(() => {
		if (displayIcons) {
			return (
				<Group position='right' spacing={0} noWrap>
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
		<Group position='apart' align='center' noWrap>
			<Box maw={maxWidth} style={{ overflow: 'hidden' }}>
				<Breadcrumb {...breadcrumb} />
			</Box>
			{rightSection}
		</Group>
	)
}

// type TitleIcons = keyof typeof iconMap

type ToolbarIcons = 'save' | 'share'

type _ModalTitleProps<TIcons extends ToolbarIcons[]> = {
	breadcrumb: Omit<BreadcrumbProps, 'onClick'> & {
		onClick: MouseEventHandler<HTMLButtonElement> | (() => void)
	}
	icons?: TIcons
	rightText?: string
	serviceId?: 'save' extends TIcons[number] ? string : never
	maxWidth?: string
}
export type ModalTitleProps = _ModalTitleProps<ToolbarIcons[]>
