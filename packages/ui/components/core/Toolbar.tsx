import { createStyles, Group, rem, Space } from '@mantine/core'

import { ActionButtons } from './ActionButtons'
import { Breadcrumb, type BreadcrumbProps } from './Breadcrumb'

const useStyles = createStyles(() => ({
	toolbar: {
		// padding: `${rem(0)} ${rem(8)} ${rem(0)} ${rem(12)}`,
		marginLeft: rem(-8),
	},
}))

export const Toolbar = ({ breadcrumbProps, hideBreadcrumb, ...ids }: Props) => {
	const { classes } = useStyles()

	return (
		<Group position='apart' align='center' w='100%' noWrap className={classes.toolbar}>
			{hideBreadcrumb ? <Space w={1} /> : <Breadcrumb {...breadcrumbProps} />}
			<ActionButtons.Group>
				<ActionButtons.Review data-targetid='review' />
				<ActionButtons.Share data-targetid='share' />
				<ActionButtons.Save
					data-targetid='save'
					itemId={ids.serviceId ?? ids.organizationId}
					itemName={breadcrumbProps.backToText ?? ''}
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
}
