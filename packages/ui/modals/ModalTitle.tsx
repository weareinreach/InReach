import { Group } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { useTranslation } from 'next-i18next'

import { ActionButtons, Breadcrumb } from '~ui/components/core'

export const ModalTitle = ({ backToText }: ModalTitleProps) => {
	const { t } = useTranslation()
	return (
		<Group position='apart' noWrap>
			<Breadcrumb
				option='back'
				backTo='dynamicText'
				backToText={backToText}
				onClick={() => {
					closeAllModals()
				}}
			/>
			<Group position='right' spacing={0} noWrap>
				<ActionButtons iconKey='share' omitLabel />
				<ActionButtons iconKey='save' omitLabel />
			</Group>
		</Group>
	)
}

export type ModalTitleProps = { backToText: string }
