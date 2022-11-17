import { type ReactNode } from 'react'

import { AppShell } from '@mantine/core'

import { FooterSection, Nav } from '../components/layout'

export const AppLayout = ({ children, navItems, footerLinks }: Props) => {
	return (
		<AppShell header={<Nav navItems={navItems} />} footer={<FooterSection links={footerLinks} />}>
			{children}
		</AppShell>
	)
}

type Props = {
	children: ReactNode
	navItems: NavItem[]
	footerLinks: NavItem[]
}

export type NavItem = {
	key: string
	href: string
}
