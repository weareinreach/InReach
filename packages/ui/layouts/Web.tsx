import { LayoutProps } from '@inreach/ui'
import {
	AppShell,
	Button,
	createStyles,
	Group,
	Header,
	Title,
} from '@mantine/core'

const useStyles = createStyles((theme) => ({
	headerTopGroup: {
		backgroundColor: theme.colors.primary[5],
		button: {
			// backgroundColor: theme.colors.primary[4],
			color: 'white',
			borderColor: 'white',
		},
	},
}))

const InReachHeader = () => {
	const { classes } = useStyles()
	return (
		<Header height={215}>
			<Group className={classes.headerTopGroup}>
				<Title order={1} color='white' size='h5' transform='uppercase'>
					See LGBTQ+ resources. Reach safety. Find belonging.
				</Title>
				<Button uppercase variant='outline'>
					Find safe resources
				</Button>
				<Button uppercase>Get mobile app</Button>
			</Group>
			<Group></Group>
		</Header>
	)
}

export const WebLayout = ({ children }: LayoutProps) => {
	return (
		<AppShell header={<InReachHeader />} fixed={false}>
			{children}
		</AppShell>
	)
}
