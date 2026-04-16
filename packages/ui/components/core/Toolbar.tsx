import { Box, createStyles, Group, Menu, rem, Space } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

import { ActionButtons } from './ActionButtons'
import { Breadcrumb, type BreadcrumbProps } from './Breadcrumb'

const useStyles = createStyles((theme) => ({
	toolbar: {
		// padding: `${rem(0)} ${rem(8)} ${rem(0)} ${rem(12)}`,
		marginLeft: rem(-8),
	},
}))

export const Toolbar = ({ breadcrumbProps, hideBreadcrumb, itemName, ...ids }: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')

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
					itemName={itemName ?? breadcrumbProps.backToText ?? ''}
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
