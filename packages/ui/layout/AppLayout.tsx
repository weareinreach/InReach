import { type ReactNode } from 'react'

import { AppShell } from '@mantine/core'

import { Nav } from '../components/layout'

export const AppLayout = ({ children, navItems }: Props) => {
	return <AppShell header={<Nav navItems={navItems} />}>{children}</AppShell>
}

type Props = {
	children: ReactNode
	navItems: NavItem[]
}

export type NavItem = {
	key: string
	href: string
}
