import { Box, Group, Text } from '@mantine/core'
import { type MouseEventHandler, useMemo } from 'react'

import { ActionButtons } from '~ui/components/core/ActionButtons'
import { Breadcrumb, type BreadcrumbProps, isValidBreadcrumbProps } from '~ui/components/core/Breadcrumb'
import { useCustomVariant } from '~ui/hooks'

export const ModalTitle = <TIcons extends ToolbarIcons[]>(props: _ModalTitleProps<TIcons>) => {
	const { breadcrumb, icons, rightText, serviceId } = props
	const variants = useCustomVariant()
	if (!isValidBreadcrumbProps(breadcrumb)) {
		throw new Error('invalid Breadcrumb props')
	}

	const iconMap = useMemo(() => {
		const SaveButton =
			serviceId && breadcrumb.backToText ? (
				<ActionButtons.Save
					key='modal-title-save'
					omitLabel
					itemId={serviceId}
					itemName={breadcrumb.backToText}
				/>
			) : null

		const ShareButton = <ActionButtons.Share omitLabel />

		return {
			save: SaveButton,
			share: ShareButton,
		}
	}, [breadcrumb.backToText, serviceId])

	const displayIcons = useMemo(
		() => (icons?.length ? icons.map((item) => iconMap[item]) : undefined),
		[iconMap, icons]
	)

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [displayIcons, rightText])

	return (
		<Group position='apart' align='center' noWrap>
			<Box maw='70%' style={{ overflow: 'hidden' }}>
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
}
export type ModalTitleProps = _ModalTitleProps<ToolbarIcons[]>
