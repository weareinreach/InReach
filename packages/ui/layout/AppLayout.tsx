import { AppShell } from '@mantine/core'
import { type ReactNode } from 'react'

import { FooterSection, type FooterSectionProps } from '../components/layout/Footer'
import { Nav, type NavItem } from '../components/layout/Nav'

export const AppLayout = ({ children, navItems, footerLinks, socialMedia }: Props) => {
	return (
		<AppShell
			// header={<Nav navItems={navItems} />}
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
