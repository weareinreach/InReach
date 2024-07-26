import { ActionIcon, Group, Tooltip } from '@mantine/core'
import { type ReactNode, useCallback } from 'react'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

export const ServiceAreaItem = ({
	serviceId,
	serviceAreaId,
	countryId,
	govDistId,
	children,
}: ServiceAreaItemProps) => {
	const apiUtils = api.useUtils()
	const removeServiceArea = api.serviceArea.delFromArea.useMutation({
		onSuccess: () => apiUtils.service.forServiceEditDrawer.invalidate(serviceId),
	})

	const actionHandler = useCallback(() => {
		if (serviceAreaId) {
			removeServiceArea.mutate({ serviceAreaId, countryId, govDistId })
		}
	}, [countryId, govDistId, removeServiceArea, serviceAreaId])

	if (!serviceAreaId || !(countryId || govDistId)) {
		return children
	}

	return (
		<Group noWrap spacing={0}>
			<Tooltip label='Delete'>
				<ActionIcon onClick={actionHandler}>
					<Icon icon='carbon:trash-can' />
				</ActionIcon>
			</Tooltip>
			{children}
		</Group>
	)
}

interface ServiceAreaItemProps {
	serviceId: string
	serviceAreaId?: string
	countryId?: string
	govDistId?: string
	children: ReactNode
}
