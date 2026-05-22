import { createStyles, Group, rem, Space } from '@mantine/core'

import { ActionButtons } from './ActionButtons'
import { Breadcrumb, type BreadcrumbProps } from './Breadcrumb'

const useStyles = createStyles(() => ({
	toolbar: {
		// padding: `${rem(0)} ${rem(8)} ${rem(0)} ${rem(12)}`,
		marginLeft: rem(-8),
	},
}))

export const Toolbar = ({ breadcrumbProps, hideBreadcrumb, itemName, ...ids }: Props) => {
	const { classes } = useStyles()

	const isService = !!ids.serviceId

	const bc = breadcrumbProps as { backToText?: string }
	const reportOrgId = ids.organizationId
	const reportOrgName = isService ? bc.backToText : itemName // Org name for service, or item name for org
	const reportServiceId = ids.serviceId // Service ID if it's a service
	const reportServiceName = isService ? itemName : undefined // Service name if it's a service, otherwise undefined

	const displayItemName = itemName ?? bc.backToText ?? 'Report' // Concise name for modal title

	return (
		<Group position='apart' align='center' w='100%' noWrap className={classes.toolbar}>
			{hideBreadcrumb ? <Space w={1} /> : <Breadcrumb {...breadcrumbProps} />}
			<ActionButtons.Group>
				<ActionButtons.Review data-targetid='review' key='review' />
				<ActionButtons.Share data-targetid='share' key='share' />
				<ActionButtons.Save
					data-targetid='save'
					itemId={ids.serviceId || ids.organizationId}
					itemName={itemName ?? breadcrumbProps.backToText ?? ''}
					key='save'
				/>
				<ActionButtons.Report
					data-targetid='report'
					itemId={ids.serviceId || ids.organizationId}
					itemName={displayItemName} // A simple display name for the modal title
					orgId={reportOrgId}
					orgName={reportOrgName}
					serviceId={reportServiceId}
					serviceName={reportServiceName}
					key='report'
				/>
			</ActionButtons.Group>
		</Group>
	)
}

type Props = {
	breadcrumbProps: BreadcrumbProps
	organizationId: string
	serviceId?: string
	hideBreadcrumb?: boolean
	itemName?: string
}
