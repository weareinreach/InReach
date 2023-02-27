import { Group } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { useTranslation } from 'next-i18next'

import { ActionButtons, Breadcrumb, BreadcrumbTypes } from '~ui/components/core'

const iconMap = {
	save: <ActionButtons iconKey='save' omitLabel />,
	share: <ActionButtons iconKey='share' omitLabel />,
} as const

export const ModalTitle = (props: ModalTitleProps) => {
	const { breadcrumb, icons } = props
	const { t } = useTranslation()

	return (
		<Group position='apart' noWrap>
			<Breadcrumb
				onClick={() => {
					closeAllModals()
				}}
				{...breadcrumb}
			/>
			{icons?.length && (
				<Group position='right' spacing={0} noWrap>
					{' '}
					{icons.map((item) => iconMap[item])}
				</Group>
			)}
		</Group>
	)
}

type TitleIcons = keyof typeof iconMap

export type ModalTitleProps = {
	breadcrumb: BreadcrumbTypes
	icons?: TitleIcons[]
}
