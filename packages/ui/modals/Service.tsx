import { ModalSettings } from '@mantine/modals/lib/context'
import { ApiOutput } from '@weareinreach/api'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

export const ServiceModalBody = ({ service }: ServiceModalBodyProps) => {
	return <></>
}

export const ServiceModal = (props: ServiceModalProps) =>
	({
		title: <ModalTitle {...props.title} />,
		children: <ServiceModalBody {...props.body} />,
	} satisfies ModalSettings)

type ServiceModalBodyProps = {
	service: ApiOutput['service']['byId']
}

export type ServiceModalProps = {
	title: ModalTitleProps
	body: ServiceModalBodyProps
}
