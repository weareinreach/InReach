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
	// Corrected the type definition to allow for Date or null values
	data: {
		id: string
		name: string
		lastUpdated: string
		lastVerified: Date | null
		firstPublished: string | null
	}
}) => {
	const { classes } = useMessageBodyStyles()

	// Convert the Date object to a string before passing to the Activity component
	const lastVerified = data.lastVerified ? data.lastVerified.toISOString() : null

	return (
		<>
			<div className={classes.toolbar}>
				{/* Pass the converted string values to the Activity component */}
				<Activity
					lastUpdated={data.lastUpdated}
					lastVerified={lastVerified}
					firstPublished={data.firstPublished}
				/>
				<Action data={data} />
			</div>
			<div>
				<Divider my='lg' mb='md' />
			</div>
		</>
	)
}
