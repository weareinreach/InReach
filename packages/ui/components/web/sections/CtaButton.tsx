import { HTMLAttributeAnchorTarget } from 'react'

import { Button } from '@mantine/core'
import { NextLink } from '@mantine/next'

import { PreviewWithStyles } from '../cms'

export interface CtaButtonProps {
	value: {
		title: string
		href: string
	}
	target?: HTMLAttributeAnchorTarget
}

export const CtaPreview = ({ value }: CtaButtonProps) => {
	if (!value) return null

	return (
		<PreviewWithStyles>
			<CtaButton value={value} target='_blank' />
		</PreviewWithStyles>
	)
}

export const CtaButton = ({ value, target }: CtaButtonProps) => {
	if (!value) return null
	const { title, href } = value
	if (!href) return null
	return (
		<Button component={NextLink} href={href} target={target}>
			{title}
		</Button>
	)
}
