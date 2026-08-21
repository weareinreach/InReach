import { ActionIcon, Group, Tooltip, useMantineTheme } from '@mantine/core'
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
	const theme = useMantineTheme()
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
		<Group wrap='nowrap' gap={0}>
			<Tooltip label='Delete'>
				<ActionIcon variant='subtle' onClick={actionHandler}>
					<Icon icon='carbon:trash-can' color={theme.other.colors.primary.allyGreen} />
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
