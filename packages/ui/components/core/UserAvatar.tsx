import { Avatar, Group, rem, Skeleton, Stack, Text, useMantineTheme } from '@mantine/core'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { type User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'

export const UserAvatar = ({
	subheading,
	user,
	useLoggedIn = false,
	loading = false,
	avatarSize = 40,
}: UserAvatarProps) => {
	const variants = useCustomVariant()
	const { t, i18n } = useTranslation()
	const { data: session, status } = useSession()
	const theme = useMantineTheme()
	const router = useRouter()

	const subText = () => {
		if (!user && useLoggedIn && subheading !== undefined) {
			return <Text variant={variants.Text.utility2darkGray}>{session?.user.email}</Text>
		}
		switch (typeof subheading) {
			case null: {
				return null
			}
			case undefined: {
				return undefined
			}
			case 'string': {
				return <Text variant={variants.Text.utility2darkGray}>{subheading as string}</Text>
			}
			default: {
				if (!(subheading instanceof Date)) {
					return null
				}
				return (
					<Text variant={variants.Text.utility2darkGray}>
						{DateTime.fromJSDate(subheading)
							.setLocale(i18n.resolvedLanguage ?? 'en')
							.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
					</Text>
				)
			}
		}
	}

	const areWeStillLoading = () => {
		if (loading || status === 'loading') {
			return true
		}
		if (typeof window !== 'undefined') {
			return router.isFallback
		}
		return false
	}

	const showLoadingState = areWeStillLoading()
	const groupGap = rem(avatarSize >= 48 ? 12 : 4)
	if (showLoadingState) {
		return (
			<Group style={{ gap: groupGap }}>
				<Skeleton height={avatarSize} circle />
				<Stack align='flex-start' justify='center' gap={4}>
					<Skeleton variant='utility' />
					{Boolean(subText()) && <Skeleton variant='utility'>{subText()}</Skeleton>}
				</Stack>
			</Group>
		)
	}

	const displayData = {
		image: user && !useLoggedIn ? user.image : session?.user.image,
		name: user && !useLoggedIn ? user.name : session?.user.name,
	}

	return (
		<Group style={{ gap: groupGap }} align='center'>
			<Avatar
				src={displayData.image}
				alt={displayData.name ?? t('user-avatar')}
				styles={{
					root: { height: rem(avatarSize), width: rem(avatarSize) },
					placeholder: { height: rem(avatarSize), width: rem(avatarSize) },
				}}
			>
				<Icon icon='carbon:user' height={24} color={theme.other.colors.secondary.darkGray} />
			</Avatar>
			<Stack align='flex-start' justify='center' gap={4}>
				<Text variant={variants.Text.utility1}>{displayData.name ?? t('in-reach-user')}</Text>
				{subText()}
			</Stack>
		</Group>
	)
}

export type UserAvatarProps = PropsPassed | PropsSession

interface PropsPassed {
	/** Get user info from the user's logged in session */
	useLoggedIn?: false
	/** Date or text to display below the user's name */
	subheading?: Date | string
	/** User info to display */
	user?: Pick<User, 'name' | 'image'>
	/** Return loading state */
	loading?: boolean
	avatarSize?: number
}

interface PropsSession {
	/** Get user info from the user's logged in session */
	useLoggedIn: true
	/** Date or text to display below the user's name. If `undefined`, the user's email address will be displayed */
	subheading?: Date | string | null
	user?: never
	loading?: never
	avatarSize?: number
}
