import { Group, Stack, Title, List } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { ModalSettings } from '@mantine/modals/lib/context'
import { useTranslation } from 'next-i18next'

import { ActionButtons, Badge, Breadcrumb } from '~ui/components/core'

export const ExampleModalTitle = ({ backToText }: ExampleModalTitleProps) => {
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

export const ExampleModalBody = ({ text }: ExampleModalBodyProps) => (
	<Stack>
		<Badge variant='serviceTag'>{text}</Badge>
		<Title order={3}>Sample Content</Title>
		<List>
			<List.Item>List</List.Item>
			<List.Item>of</List.Item>
			<List.Item>things</List.Item>
		</List>
	</Stack>
)

export const ExampleModal = (props: ExampleModalProps) =>
	({
		title: <ExampleModalTitle {...props.title} />,
		children: <ExampleModalBody {...props.body} />,
	} satisfies ModalSettings)

export type ExampleModalBodyProps = {
	text: string
}

export type ExampleModalTitleProps = { backToText: string }

export type ExampleModalProps = {
	title: ExampleModalTitleProps
	body: ExampleModalBodyProps
}
