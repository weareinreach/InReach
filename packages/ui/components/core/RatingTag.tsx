import { Icon } from '@iconify/react'

import { Group, Text, createStyles } from '@mantine/core'

const useStyles = createStyles((theme) => ({
	container: {
		width: 'auto',
	},
	icon: {
		height: '21px',
		width: '22px',
		fontSize: '20px',
	},
	text: {},
}))

export const RatingTag = ({ average, totalReviews }: Props) => {
	const { classes } = useStyles()
	return (
		<Group position='center' spacing={5} className={classes.container}>
			<Icon icon='ic:baseline-star' className={classes.icon} />
			<Text className={classes.text}>
				{average} ({totalReviews} reviews)
			</Text>
		</Group>
	)
}

type Props = {
	average: string
	totalReviews: string
}
