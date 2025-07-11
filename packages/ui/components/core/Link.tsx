import { Anchor, type AnchorProps, type Variants } from '@mantine/core'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { forwardRef } from 'react'

const externalPrefixes = ['http', 'tel:', 'mailto:', 'sms:'] as const

export const isExternal = (href: unknown): href is ExternalLink => {
	const regexChunk = (str: string) => `(?:${str})`
	const regex = new RegExp(`${externalPrefixes.map(regexChunk).join('|')}`)
	return Boolean(typeof href === 'string' && regex.test(href))
}

export interface LinkProps extends Omit<NextLinkProps, 'href' | 'color'>, AnchorProps {
	href?: InternalLink | ExternalLink
	external?: boolean
	variant?: Variants<'inline' | 'inlineInverted'>
	target?: '_self' | '_blank' | '_parent' | '_top' | string
	rel?: string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
	({ children, href, external, target, rel, ...rest }, ref) => {
		const isExternalLink = external === true || href === undefined || isExternal(href)

		const anchorTarget = target || (isExternalLink ? '_blank' : '_self')
		const anchorRel = rel || (isExternalLink && anchorTarget === '_blank' ? 'noopener noreferrer' : undefined)

		if (isExternalLink) {
			return (
				<Anchor ref={ref} component='a' href={href as string} target={anchorTarget} rel={anchorRel} {...rest}>
					{children}
				</Anchor>
			)
		}

		return (
			<Anchor ref={ref} component={NextLink} href={href} target={anchorTarget} rel={anchorRel} {...rest}>
				{children}
			</Anchor>
		)
	}
)

Link.displayName = 'Link'

export type InternalLink = NextLinkProps['href']
export type ExternalLink = `${(typeof externalPrefixes)[number]}${string}`
