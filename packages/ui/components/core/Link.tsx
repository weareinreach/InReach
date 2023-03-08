import { Anchor, Variants } from '@mantine/core'
import NextLink, { type LinkProps } from 'next/link'

const externalPrefixes = ['http', 'tel:', 'mailto:'] as const

export const isExternal = (href: unknown): href is ExternalLink => {
	const regex = new RegExp(`${externalPrefixes.map((prefix) => `(?:${prefix})|`)}`)
	return Boolean(typeof href === 'string' && regex.test(href))
}

export const Link = ({ children, href, external, ...rest }: Props) => {
	console.log('link', children, href, external, rest, isExternal(href))

	if (external === true || href === undefined || isExternal(href)) {
		return (
			<Anchor component='a' href={href as string} target='_blank' {...rest}>
				{children}
			</Anchor>
		)
	}

	return (
		<Anchor component={NextLink} href={href} {...rest}>
			{children}
		</Anchor>
	)
}

type InternalLink = LinkProps['href']
type ExternalLink = `${(typeof externalPrefixes)[number]}${string}`

interface Props extends Omit<LinkProps, 'href'> {
	href?: InternalLink | ExternalLink
	external?: boolean
	variant?: Variants<'inline' | 'inlineInverted'>
}
