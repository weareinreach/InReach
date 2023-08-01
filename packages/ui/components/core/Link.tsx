import { Anchor, type AnchorProps, type Variants } from '@mantine/core'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { forwardRef } from 'react'

const externalPrefixes = ['http', 'tel:', 'mailto:', 'sms:'] as const

export const isExternal = (href: unknown): href is ExternalLink => {
	const regex = new RegExp(`${externalPrefixes.map((prefix) => `(?:${prefix})|`)}`)
	return Boolean(typeof href === 'string' && regex.test(href))
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ children, href, external, ...rest }, ref) => {
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
export type InternalLink = NextLinkProps['href']
export type ExternalLink = `${(typeof externalPrefixes)[number]}${string}`

export interface LinkProps extends Omit<NextLinkProps, 'href' | 'color'>, AnchorProps {
	href?: InternalLink | ExternalLink
	external?: boolean
	variant?: Variants<'inline' | 'inlineInverted'>
}
