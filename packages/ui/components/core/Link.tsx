import { Anchor, type AnchorProps } from '@mantine/core'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { forwardRef, type ReactNode } from 'react'

const externalPrefixes = ['http', 'tel:', 'mailto:', 'sms:'] as const

export const isExternal = (href: unknown): href is ExternalLink => {
	const regexChunk = (str: string) => `(?:${str})`
	const regex = new RegExp(`${externalPrefixes.map(regexChunk).join('|')}`)
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
	variant?: 'inline' | 'inlineInverted' | (string & {})
	target?: string
	rel?: string
	children?: ReactNode
}

// Turbopack has a confirmed history of hydration mismatches specifically for `next/dynamic(() =>
// import(...).then((mod) => mod.NamedExport))` (vercel/next.js#70795) - a default export sidesteps
// the named-export resolution path entirely, letting `dynamic(() => import('./Link'))` be used
// directly with no `.then()`.
export default Link
