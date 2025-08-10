import { createStyles, Divider } from '@mantine/core'

import { Action } from '~ui/components/data-portal/Action'
import { Activity } from '~ui/components/data-portal/Activity'

const useMessageBodyStyles = createStyles((theme) => ({
	toolbar: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
	},
}))

export const DataToolbar = ({
	data,
}: {
	data: {
		id: string
		name: string
		lastUpdated: string | null
		lastVerified: string | null
		firstPublished: string | null
	}
}) => {
	const { classes } = useMessageBodyStyles()

	const { lastUpdated, lastVerified, firstPublished } = data

	return (
		<>
			<div className={classes.toolbar}>
				<Activity lastUpdated={lastUpdated} lastVerified={lastVerified} firstPublished={firstPublished} />{' '}
				<Action data={data} />
			</div>
			<div>
				<Divider my='lg' mb='md' />
			</div>
		</>
	)
}
