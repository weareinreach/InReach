import { Group, useMantineTheme, createStyles, rem } from '@mantine/core'
import { useViewportSize, useMediaQuery } from '@mantine/hooks'

import { ActionButtons, Breadcrumb, BreadcrumbProps } from './'
import { actionButtonIcons } from './ActionButtons'

const MIN_BUTTON_WIDTH = 55.2
const BREACRUMB_WIDTH = 162

const useStyles = createStyles((theme) => ({
	toolbar: {
		padding: `${rem(0)} ${rem(8)} ${rem(0)} ${rem(12)}`,
	},
}))

export const Toolbar = ({ saved = false, breadcrumbProps }: Props) => {
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const { width } = useViewportSize()
	const { classes } = useStyles()
	const buttons = ['review', 'share', saved ? 'saved' : 'save']

	console.log('isMobile', isMobile)

	const buttonsInViewPort = isMobile ? Math.ceil((width - BREACRUMB_WIDTH) / MIN_BUTTON_WIDTH) % 3 : 4

	/* Contains the actionButtons displayed outside the 'more' actionButton menu */
	const inToolbar = buttonsInViewPort > 3 ? buttons : buttons.slice(-(buttonsInViewPort + 1))

	const displayButtons = inToolbar.map((button) => (
		<ActionButtons key={button} iconKey={button as keyof typeof actionButtonIcons} omitLabel={isMobile} />
	))

	// If 'saved' do not display 'save' button and viceversa
	inToolbar.push(saved ? 'save' : 'saved')

	return (
		<Group position='apart' align='center' w='100%' noWrap className={classes.toolbar}>
			<Breadcrumb {...breadcrumbProps} />
			<Group noWrap spacing={0}>
				{displayButtons}
				<ActionButtons iconKey='more' outsideMoreMenu={inToolbar} />
			</Group>
		</Group>
	)
}

type Props = {
	saved: boolean
	breadcrumbProps: BreadcrumbProps
}
