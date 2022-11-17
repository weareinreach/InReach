import { type ReactNode } from 'react'

import { AppShell } from '@mantine/core'

import { FooterSection, type FooterSectionProps, Nav } from '../components/layout'

export const AppLayout = ({ children, navItems, footerLinks, socialMedia }: Props) => {
	return (
		<AppShell
			header={<Nav navItems={navItems} />}
			footer={<FooterSection links={footerLinks} socialMedia={socialMedia} />}
		>
			{children}
		</AppShell>
	)
}

type Props = {
	children: ReactNode
	navItems: NavItem[]
	footerLinks: FooterSectionProps['links']
	socialMedia: FooterSectionProps['socialMedia']
}

export type NavItem = {
	key: string
	href: string
}
