import { List, Stack, Title } from '@mantine/core'
import { type ModalSettings } from '@mantine/modals/lib/context'

import { Badge } from '~ui/components/core/Badge'

import { ModalTitle, type ModalTitleProps } from './ModalTitle'

export const ExampleModalBody = ({ text }: ExampleModalBodyProps) => (
	<Stack>
		<Badge variant='service' tsKey='deferred-action-for-childhood-arrivals-daca' />
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
		title: <ModalTitle {...props.title} />,
		children: <ExampleModalBody {...props.body} />,
	}) satisfies ModalSettings

export type ExampleModalBodyProps = {
	text: string
}

export type ExampleModalProps = {
	title: ModalTitleProps
	body: ExampleModalBodyProps
}
