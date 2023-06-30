import { Anchor, type AnchorProps, type Variants } from '@mantine/core'
import NextLink, { type LinkProps } from 'next/link'
import { forwardRef } from 'react'

const externalPrefixes = ['http', 'tel:', 'mailto:'] as const

export const isExternal = (href: unknown): href is ExternalLink => {
	const regex = new RegExp(`${externalPrefixes.map((prefix) => `(?:${prefix})|`)}`)
	return Boolean(typeof href === 'string' && regex.test(href))
}

export const Link = forwardRef<HTMLAnchorElement, Props>(({ children, href, external, ...rest }, ref) => {
	if (external === true || href === undefined || isExternal(href)) {
		return (
			<Anchor ref={ref} component='a' href={href as string} target='_blank' {...rest}>
				{children}
			</Anchor>
		)
	}

	return (
		<Anchor ref={ref} component={NextLink} href={href} target='_self' {...rest}>
			{children}
		</Anchor>
	)
})
Link.displayName = 'Link'
export type InternalLink = LinkProps['href']
export type ExternalLink = `${(typeof externalPrefixes)[number]}${string}`

interface Props extends Omit<LinkProps, 'href' | 'color'>, AnchorProps {
	href?: InternalLink | ExternalLink
	external?: boolean
	variant?: Variants<'inline' | 'inlineInverted'>
}
