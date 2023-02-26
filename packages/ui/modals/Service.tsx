import { ModalSettings } from '@mantine/modals/lib/context'

import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

export const ServiceModalBody = ({ serviceId }: ServiceModalBodyProps) => {
	const { data, status } = api.service.byId.useQuery({ id: serviceId })

	return <></>
}

export const ServiceModal = (props: ServiceModalProps) =>
	({
		title: <ModalTitle {...props.title} />,
		children: <ServiceModalBody {...props.body} />,
	} satisfies ModalSettings)

type ServiceModalBodyProps = {
	serviceId: string
}

type ServiceModalProps = {
	title: ModalTitleProps
	body: ServiceModalBodyProps
}
