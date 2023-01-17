import { Group, createStyles, Text } from '@mantine/core'
import React from 'react'

import { LeaderBadge, LeaderBadgeProps } from './LeaderBadge'

const useStyles = createStyles(() => ({
	separator: {
		fontSize: '1.5rem',
		display: 'inline',
		paddingLeft: '4px',
		paddingRight: '4px',
	},
}))

export const LeaderBadgeGroup = ({ badges }: Props) => {
	const { classes } = useStyles()

	const badgeList = badges.map((item: LeaderBadgeProps, idx, arr) =>
		idx + 1 !== arr.length && !item.minify ? (
			<>
				<LeaderBadge key={item.key_value} {...item} />
				<Text className={classes.separator} inline>{`\u2022`}</Text>
			</>
		) : (
			<LeaderBadge key={item.key_value} {...item} />
		)
	)

	return (
		<Group position='left' spacing={1}>
			{badgeList}
		</Group>
	)
}

type Props = {
	badges: LeaderBadgeProps[]
}
