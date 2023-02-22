import { Group, createStyles, Text } from '@mantine/core'

import { LeaderBadge, LeaderBadgeProps } from './LeaderBadge'

const useStyles = createStyles((theme) => ({
	separator: {
		fontSize: '1.5rem',
		display: 'inline',
		paddingLeft: theme.spacing.xs,
		paddingRight: theme.spacing.xs,
	},
}))

export const LeaderBadgeGroup = ({ badges }: Props) => {
	const { classes } = useStyles()

	const WithSeparator = (item: LeaderBadgeProps) => (
		<>
			<LeaderBadge {...item} />
			<Text className={classes.separator} inline>{`\u2022`}</Text>
		</>
	)
	const badgeList = badges.map((item: LeaderBadgeProps, idx, arr) =>
		idx + 1 !== arr.length && !item.minify ? (
			<WithSeparator key={item.key_value} {...item} />
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
	/** Array of LeaderBadge props */
	badges: LeaderBadgeProps[]
}
