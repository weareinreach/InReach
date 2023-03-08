import { Anchor, Variants } from '@mantine/core'
import NextLink, { type LinkProps } from 'next/link'

export const Link = ({ children, href, external, ...rest }: Props) => {
	if (
		external === true ||
		href === undefined ||
		(typeof href === 'string' && href.substring(0, 3) === 'http')
	) {
		return (
			<Anchor component='a' {...rest}>
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

interface Props extends Omit<LinkProps, 'href'> {
	href?: LinkProps['href'] | `http${string}`
	external?: boolean
	variant?: Variants<'inline'>
}
