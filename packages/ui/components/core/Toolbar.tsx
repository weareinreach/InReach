import { createStyles, Group, rem, Space, useMantineTheme } from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'

import { type actionButtonIcons, ActionButtons } from './ActionButtons'
import { Breadcrumb, type BreadcrumbProps } from './Breadcrumb'

const MIN_BUTTON_WIDTH = 55.2
const BREACRUMB_WIDTH = 162

const useStyles = createStyles(() => ({
	toolbar: {
		// padding: `${rem(0)} ${rem(8)} ${rem(0)} ${rem(12)}`,
		marginLeft: rem(-8),
	},
}))

export const Toolbar = ({ saved = false, breadcrumbProps, hideBreadcrumb, ...ids }: Props) => {
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const { width } = useViewportSize()
	const { classes } = useStyles()
	const buttons = ['review', 'share', 'save']

	const buttonsInViewPort = isMobile ? Math.ceil((width - BREACRUMB_WIDTH) / MIN_BUTTON_WIDTH) % 3 : 4

	/* Contains the actionButtons displayed outside the 'more' actionButton menu */
	const inToolbar = buttonsInViewPort > 3 ? buttons : buttons.slice(-(buttonsInViewPort + 1))

	const displayButtons = inToolbar.map((button) => (
		<ActionButtons key={button} iconKey={button as keyof typeof actionButtonIcons} omitLabel={isMobile} />
	))

	// If organization is not saved do not display saved button
	if (!saved) inToolbar.push('saved')

	// No delete button in toolbar
	inToolbar.push('delete')

	return (
		<Group position='apart' align='center' w='100%' noWrap className={classes.toolbar}>
			{hideBreadcrumb ? <Space w={1} /> : <Breadcrumb {...breadcrumbProps} />}
			<Group noWrap spacing={0}>
				{displayButtons}
				<ActionButtons iconKey='more' outsideMoreMenu={inToolbar} {...ids} />
			</Group>
		</Group>
	)
}

type Props = {
	saved: boolean
	breadcrumbProps: BreadcrumbProps
	organizationId: string
	serviceId?: string
	hideBreadcrumb?: boolean
}
