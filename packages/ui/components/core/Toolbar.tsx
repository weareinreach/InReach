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
	overflowButton: {
		background: 'none',
		border: 'none',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: rem(12),
		width: rem(48),
		height: rem(48),
		borderRadius: rem(8),
		gap: rem(8),
		transition: 'background-color 150ms ease',
		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},
	},
}))

export const Toolbar = ({ breadcrumbProps, hideBreadcrumb, itemName, ...ids }: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')

	return (
		<Group position='apart' align='center' w='100%' noWrap className={classes.toolbar}>
			{hideBreadcrumb ? <Space w={1} /> : <Breadcrumb {...breadcrumbProps} />}
			<ActionButtons.Group>
				<ActionButtons.Review data-targetid='review' />
				<ActionButtons.Share data-targetid='share' />
				<ActionButtons.Save
					data-targetid='save'
					itemId={ids.serviceId || ids.organizationId}
					itemName={itemName ?? breadcrumbProps.backToText ?? ''}
				/>
				<ActionButtons.Report
					data-targetid='report'
					itemId={ids.serviceId || ids.organizationId}
					itemName={itemName ?? breadcrumbProps.backToText ?? ''}
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
