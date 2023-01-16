import { Container, Group, Text, createStyles } from '@mantine/core'
import React from 'react'

import { BadgeComponent, BadgeProps } from './Badge'

const useStyles = createStyles((theme) => ({
	group: {},
}))

export const BadgeComponentGroup = ({ badges }: Props) => {
	const { classes } = useStyles()

	const badgesS = badges.map((item: BadgeProps) => <BadgeComponent key={item.key_value} {...item} />)

	return (
		<Group className={classes.group} position='left' spacing={1}>
			{badgesS}
		</Group>
	)
}

type Props = {
	badges: BadgeProps[]
}
