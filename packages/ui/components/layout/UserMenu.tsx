import { Icon } from '@iconify/react'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import Image from 'next/image'

import { useState } from 'react'

import { Avatar, Menu, Skeleton, Text, UnstyledButton } from '@mantine/core'

export const UserMenu = () => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const [userMenuOpen, setUserMenuOpen] = useState(false)

	if (status === 'loading' && !session) {
		return (
			<>
				<Skeleton height={50} circle />
				<Skeleton height={8} radius='xl' />
			</>
		)
	}

	if (session?.user) {
		return (
			<Menu
				width={260}
				position='bottom-end'
				transition='pop-top-right'
				onClose={() => setUserMenuOpen(false)}
				onOpen={() => setUserMenuOpen(true)}
			>
				<Menu.Target>
					<UnstyledButton>
						<Avatar>
							{session.user.image ? (
								<Image src={session.user.image} alt={session.user.name || t('user-avatar')} />
							) : (
								<Icon icon='fa6-solid:user' />
							)}
						</Avatar>
						<Text weight={500} size='sm' sx={{ lineHeight: 1 }} mr={3}>
							{session.user.name}
						</Text>
					</UnstyledButton>
				</Menu.Target>
			</Menu>
		)
	}
	return <>Login | Logout</>
}
